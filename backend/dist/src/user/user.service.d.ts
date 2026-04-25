import { PrismaService } from "../prisma/prisma.service";
export declare class UserService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getUserProfile(userId: string): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
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
        };
        message: string;
    }>;
}
