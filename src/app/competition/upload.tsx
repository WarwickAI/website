// Processing for uploading a competition file.
//
// A student submits their student ID and a zip file. The zip file is uploaded
// to the cloudflare R2 bucket and the student ID is sanitized and used as the
// file name.
"use server";

import { z } from "zod";
import { uploadFile } from "./cloudflare";

const rateLimitedUsers = new Map<string, number>();
const rateLimit = 60 * 60 * 1000; // 60 minutes

type ValidSubmission = {
  studentId: string;
  studentEmail: string;
  file: File;
};

type InvalidSubmission = {
  message: string;
};

const submissionSchema = z.object({
  studentId: z.string().min(6), // Student ID are 7 digits long but we allow for 6-8 incase someone has a strange ID.
  studentEmail: z.string().min(1).email().toLowerCase(),
  file: z.instanceof(File),
});

export async function handleSubmission(prevState: any, formData: FormData) {
  // Validate the submission.
  const submission: ValidSubmission | InvalidSubmission =
    validataFormDataSchema(formData);

  // Invalid submission.
  if ("message" in submission) {
    return submission;
  }

  // Valid submission below.
  if (submission.file.type !== "application/zip") {
    return { message: "File must be a zip file." };
  }
  if (submission.file.size > 5242880) {
    // 5MiB
    return { message: "File must not be larger than 5MiB." };
  }

  // Escape the student ID to be numerical only.
  submission.studentId = submission.studentId.replace(/\D/g, "");

  // Rate limit the user.
  const now = Date.now();
  const lastSubmission = rateLimitedUsers.get(submission.studentId);
  if (lastSubmission && now - lastSubmission < rateLimit) {
    console.log("Rate limited user: " + submission.studentId);
    return {
      message:
        "Your submission was rejected. Please wait 1 hour between submissions.",
    };
  } else {
    rateLimitedUsers.set(submission.studentId, now);
  }

  const file = await uploadFile(submission.file, submission.studentId + ".zip");

  return { message: `File ${submission.file.name} uploaded successfully.` };
}

function validataFormDataSchema(
  formData: FormData
): ValidSubmission | InvalidSubmission {
  try {
    return submissionSchema.parse({
      studentId: formData.get("studentId") as string,
      studentEmail: formData.get("studentEmail") as string,
      file: formData.get("file") as File,
    });
  } catch (e: any) {
    // Invalid submission are logged for debugging. Invalid submission should
    // not occur unless the client is tampering with the form.
    console.log(
      "Invalid submission: " + e.message + ". " + formData.toString()
    );
    return { message: "Invalid submission." };
  }
}
