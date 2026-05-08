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
            password: string;
            email: string;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            githubAccessToken: string | null;
            githubInstallationId: string | null;
            githubUsername: string | null;
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
                balance: string;
                userId: string;
            } | null;
            email: string;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            githubAccessToken: string | null;
            githubInstallationId: string | null;
            githubUsername: string | null;
        };
        access_token: string;
    }>;
}
