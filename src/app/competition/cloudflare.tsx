// Cloudflare R2 bucket API for sending and receiving data.
//
// We use cloudflare AWS S3 compatible api. The API for it is convoluted,
// however, I found that it was better than the workers API.

"use server";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

// Cloudflare R2 bucket details.
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

export async function uploadFileToR2(file: File, fileName: string) {
  // Upload file to the cloudflare R2 bucket through the API.
  const result = await S3.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: "application/zip",
      ContentLength: file.size,
    })
  );
  // Check if the file was uploaded successfully.
  return result.$metadata.httpStatusCode === 200;
}

// Cloudflare KV store details.
const KV_NAMESPACE_STORAGE_API_TOKEN =
  process.env.CLOUDFLARE_KV_STORAGE_API_TOKEN || "FAKE_KV_API_TOKEN";
const KV_NAMESPACE_NEW_ID =
  process.env.CLOUDFLARE_KV_STORAGE_NAMESPACE_NEW_ID || "FAKE_KV_NEW_ID";
const KV_NAMESPACE_OLD_ID =
  process.env.CLOUDFLARE_KV_STORAGE_NAMESPACE_OLD_ID || "FAKE_KV_OLD_ID";

const KV_ACCOUNT_URL = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces`;
const KV_NEW_URL = `${KV_ACCOUNT_URL}/${KV_NAMESPACE_NEW_ID}`;
const KV_OLD_URL = `${KV_ACCOUNT_URL}/${KV_NAMESPACE_OLD_ID}`;

const KV_HEADER: HeadersInit = {
  Authorization: `Bearer ${KV_NAMESPACE_STORAGE_API_TOKEN}`,
  "Content-Type": "application/json",
};

type KVValue = {
  key: string;
  value: string;
};

export async function uploadNewToKV(key_values: KVValue[]) {
  // Upload file to the cloudflare KV store through the API.
  const body = JSON.stringify(key_values);
  const result = await fetch(`${KV_NEW_URL}/bulk`, {
    method: "PUT",
    headers: KV_HEADER,
    body: body,
  });
  return result.ok;
}
