import { PrismaService } from "../prisma/prisma.service";
import { WalletService } from "../wallet/wallet.service";
export declare class UserService {
    private readonly prisma;
    private readonly walletService;
    constructor(prisma: PrismaService, walletService: WalletService);
    getUserProfile(userId: string): Promise<{
        user: {
            wallet: {
                balance: string;
                id?: string | undefined;
                createdAt?: Date | undefined;
                updatedAt?: Date | undefined;
                encryptedPK?: string | undefined;
                address?: string | undefined;
                encryptedMnemonic?: string | undefined;
                userId?: string | undefined;
            };
            id: string;
            email: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
        };
        message: string;
    }>;
}
