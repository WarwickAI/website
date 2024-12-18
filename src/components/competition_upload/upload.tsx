// Processing for uploading a competition file.
//
// A student submits their student ID and a zip file. The zip file is uploaded
// to the cloudflare R2 bucket and the student ID is sanitized and used as the
// file name.
"use server";

import { z } from "zod";
import { uploadFileToR2, uploadNewToKV } from "./cloudflare";

// Rate limit successful submissions to 1 per hour.
const rateLimitedUsers = new Map<string, number>();
const rateLimit = 60 * 60 * 1000; // 60 minutes

type ValidSubmission = {
  studentId: string;
  studentEmail: string;
  file: File;
};

type ReturnMessage = {
  message: string;
};

const submissionSchema = z.object({
  studentId: z.string().min(6), // Student ID are 7 digits long but we allow for 6-8 incase someone has a strange ID.
  studentEmail: z.string().min(1).email().toLowerCase(),
  file: z.custom((val) => val instanceof Blob, {  // "File" is client-side only. No longer server-side accessible
    message: 'Expected file to be a Blob',
  }),
});

export async function handleSubmission(prevState: any, formData: FormData) {
  // Reject if the date is before the competition start date.
  const competitionStartDate = new Date("2024-02-19T12:00:00Z");
  if (Date.now() < competitionStartDate.getTime()) {
    return { message: "Submissions are not open yet." };
  }

  // Validate the submission.
  const submission: ValidSubmission | ReturnMessage =
    validataFormDataSchema(formData);

  // ValidSubmission | ReturnMessage
  if ("message" in submission) {
    return submission;
  }
  // ValidSubmission

  // Escape the student ID to be numerical only.
  submission.studentId = submission.studentId.replace(/\D/g, "");

  // Rate limit the user from their last successful submission.
  const now = Date.now();
  const lastSubmission = rateLimitedUsers.get(submission.studentId);
  if (lastSubmission && now - lastSubmission < rateLimit) {
    console.log("Rate limited user: " + submission.studentId);
    return {
      message:
        "Your submission was rejected. Please wait 1 hour between submissions.",
    };
  }

  // Validate the file.
  if (submission.file.type !== "application/zip") {
    return { message: "File must be a zip file." };
  }
  if (submission.file.size > 5242880) {
    // 5MiB
    return { message: "File must not be larger than 5MiB." };
  }

  // Upload file to R2 and the student ID with email to KV.
  const file = await uploadFileToR2(
    submission.file,
    submission.studentId + ".zip",
  );
  if (!file) {
    console.log("R2 upload failed.");
    return { message: "File upload failed. Please try again soon." };
  }
  const kv = await uploadNewToKV([
    { key: submission.studentId, value: submission.studentEmail },
  ]);
  if (!kv) {
    console.log("KV upload failed.");
    return { message: "Form data upload failed. Please try again soon." };
  }

  updateApi();

  // Update the rate limit after a successful submission.
  rateLimitedUsers.set(submission.studentId, now);
  return { message: `File ${submission.file.name} uploaded successfully.` };
}

function validataFormDataSchema(
  formData: FormData,
): ValidSubmission | ReturnMessage {
  try {
    return submissionSchema.parse({
      studentId: formData.get("studentId") as string,
      studentEmail: formData.get("studentEmail") as string,
      file: formData.get("file") as File,
    }) as ValidSubmission;
  } catch (e: any) {
    // Invalid submission are logged for debugging. Invalid submission should
    // not occur unless the client is tampering with the form.
    console.log(
      "Invalid submission: " + e.message + ". " + formData.toString(),
    );
    return { message: "Invalid submission." } as ReturnMessage;
  }
}

const WAI_KV_CLEAR_API_TOKEN =
  process.env.WAI_KV_CLEAR_API_TOKEN || "FAKE_WAI_KV_CLEAR_API_TOKEN";

async function updateApi() {
  // Update the cloudflare API to indicate a new submission.
  const response = await fetch(process.env.NODE_ENV === "development" ? "https://localhost:3000/api/cloudflare" : "https://www.warwick.ai/api/cloudflare", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${WAI_KV_CLEAR_API_TOKEN}`,
    },
  });
  if (response.status !== 200) {
    console.log("Failed to update API: " + response.status);
  }
}
