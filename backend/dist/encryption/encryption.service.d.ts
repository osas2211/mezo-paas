import { ConfigService } from '@nestjs/config';
export declare class EncryptionService {
    private configService;
    private readonly key;
    private readonly algorithm;
    constructor(configService: ConfigService);
    encrypt(plaitText: string): string;
    decrypt(payload: string): string;
}
