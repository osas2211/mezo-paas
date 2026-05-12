// src/crypto.ts
import * as crypto from 'crypto'
import "dotenv/config"

const ALGORITHM = 'aes-256-gcm'
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY! // Must be 32 bytes

export function decrypt(content: string, iv: string, tag: string): Record<string, string> {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'utf-8'),
    Buffer.from(iv, 'hex')
  )

  decipher.setAuthTag(Buffer.from(tag, 'hex'))

  let decrypted = decipher.update(content, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  // Assuming you stored the env as a JSON string before encrypting
  return JSON.parse(decrypted)
}