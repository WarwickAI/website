// Cloudflare R2 bucket API for sending and receiving data.
//
// We use cloudflare AWS S3 compatible api. The API for it is convoluted,
// however, I found that it was better than the workers API.

"use server";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || "FAKE_ACCOUNT_ID";
const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || "FAKE_BUCKET_NAME";
const ACCESS_KEY_ID =
  process.env.CLOUDFLARE_R2_S3_ACCESS_KEY_ID || "FAKE_ACCESS_KEY_ID";
const SECRET_ACCESS_KEY =
  process.env.CLOUDFLARE_R2_S3_SECRET_ACCESS_KEY || "FAKE_SECRET_ACCESS_KEY";

// Out bucket is in the EU jurisdiction, so we must use the eu endpoint, rather
// than ${accountId}.r2...
const S3 = new S3Client({
  region: "auto",
  endpoint: `https://${ACCOUNT_ID}.eu.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

export async function uploadFile(file: File, fileName: string) {
  // Upload file to the cloudflare R2 bucket through the API.
  console.log(
    await S3.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: Buffer.from(await file.arrayBuffer()),
        ContentType: "application/zip",
        ContentLength: file.size,
      })
    )
  );

  // TODO(czarlinski): Notify the user of the success.
}
