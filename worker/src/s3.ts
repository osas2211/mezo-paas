import { S3Client, GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3"
import * as fs from "fs"
import * as path from "path"
import { pipeline } from "stream/promises"
import "dotenv/config"

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY || '',
    secretAccessKey: process.env.AWS_SECRET_KEY || ''
  }
})

export async function downloadS3Folder(prefix: string, localDir: string) {
  const list = await s3.send(new ListObjectsV2Command({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Prefix: prefix
  }))

  if (!list.Contents) return

  for (const object of list.Contents) {
    if (!object.Key) continue
    const localFilePath = path.join(localDir, object.Key.replace(prefix, ""))

    fs.mkdirSync(path.dirname(localFilePath), { recursive: true })

    const data = await s3.send(new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: object.Key
    }))

    await pipeline(data.Body as any, fs.createWriteStream(localFilePath))
  }
}