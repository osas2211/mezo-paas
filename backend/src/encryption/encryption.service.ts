import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EncryptionService {
  private readonly key: Buffer;
  private readonly algorithm = 'aes-256-gcm';

  constructor(private configService: ConfigService) {
    const secret = this.configService.get<string>('ENCRYPTION_SECRET');
    this.key = Buffer.from(secret!, 'hex');
  }

  encrypt(plaitText: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    const encrypted = Buffer.concat([
      cipher.update(plaitText, 'utf8'),
      cipher.final(),
    ]);

    const tag = cipher.getAuthTag();

    return [
      iv.toString('hex'),
      tag.toString('hex'),
      encrypted.toString('hex'),
    ].join(':');
  }

  decrypt(payload: string): string {
    const [ivHex, tagHex, encryptedHex] = payload.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');

    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(tag);

    return decipher.update(encrypted).toString() + decipher.final('utf8');
  }
}
