// src/crypto.ts
import * as crypto from 'crypto'
import "dotenv/config"

const ALGORITHM = 'aes-256-gcm'
const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET! // Must be 32 bytes
const KEY = Buffer.from(ENCRYPTION_SECRET, "hex")

export function decrypt(payload: string): Record<string, string> {
  const [ivHex, tagHex, encryptedHex] = payload.split(':')
  const iv = Buffer.from(ivHex, 'hex')
  const tag = Buffer.from(tagHex, 'hex')
  const encrypted = Buffer.from(encryptedHex, 'hex')

  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv)
  decipher.setAuthTag(tag)

  return JSON.parse(decipher.update(encrypted).toString() + decipher.final('utf8')) as Record<string, string>
}