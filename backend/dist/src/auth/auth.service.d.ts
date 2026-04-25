import { LoginDto, SignUpDto } from './dto/auth-dto';
import { PrismaService } from "../prisma/prisma.service";
import { WalletService } from "../wallet/wallet.service";
import { EncryptionService } from "../encryption/encryption.service";
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private readonly prisma;
    private readonly wallet;
    private readonly encryption;
    private jwt;
    constructor(prisma: PrismaService, wallet: WalletService, encryption: EncryptionService, jwt: JwtService);
    signup(body: SignUpDto): Promise<{
        message: string;
        user: {
            id: string;
            name: string;
            email: string;
            password: string;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    login(body: LoginDto): Promise<{
        message: string;
        user: {
            wallet: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                encryptedPK: string;
                address: string;
                encryptedMnemonic: string;
                userId: string;
                balance: string;
            } | null;
            id: string;
            name: string;
            email: string;
            createdAt: Date;
            updatedAt: Date;
        };
        access_token: string;
    }>;
}
