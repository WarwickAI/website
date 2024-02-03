// Processing for uploading a competition file.
"use server";

import { z } from "zod";

export async function handleSubmission(prevState: any, formData: FormData) {
  // Validate the submission.
  const submissionSchema = z.object({
    name: z.string().min(1),
    file: z.instanceof(File),
  });

  try {
    const submission = submissionSchema.parse({
      name: formData.get("name") as string,
      file: formData.get("file") as File,
    });

    const bytes = await submission.file.arrayBuffer();
    console.log(bytes);

    return { message: `File ${submission.file.name} uploaded successfully.` };
  } catch (e: any) {
    const sumbissionError = "Invalid submission: " + e.message + "." + formData;

    // Invalid submission are logged for debugging. Invalid submission should
    // not occur unless the client is tampering with the form.
    console.log(sumbissionError);
    return { message: "Invalid submission." };
  }
}
