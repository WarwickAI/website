// Processing for uploading a competition file.
//
// A student submits their student ID and a zip file. The zip file is uploaded
// to the cloudflare R2 bucket and the student ID is sanitized and used as the
// file name.
"use server";

import { z } from "zod";
import { uploadFile } from "./cloudflare";

export async function handleSubmission(prevState: any, formData: FormData) {
  // Validate the submission.
  const submissionSchema = z.object({
    studentId: z.string().min(1),
    file: z.instanceof(File),
  });

  try {
    const submission = submissionSchema.parse({
      studentId: formData.get("studentId") as string,
      file: formData.get("file") as File,
    });

    if (submission.file.type !== "application/zip") {
      return { message: "Invalid file type." };
    }
    if (submission.file.size > 5242880) {
      // 5MiB
      return { message: "File too large." };
    }

    // Escape the student ID text.
    const studentId = submission.studentId.replace(/[^a-zA-Z0-9]/g, "");

    // Save the file to the server as the "studentId.zip".
    const file = await uploadFile(submission.file, studentId + ".zip");

    return { message: `File ${submission.file.name} uploaded successfully.` };
  } catch (e: any) {
    const sumbissionError = "Invalid submission: " + e.message + "." + formData;

    // Invalid submission are logged for debugging. Invalid submission should
    // not occur unless the client is tampering with the form.
    console.log(sumbissionError);
    return { message: "Invalid submission." };
  }
}
