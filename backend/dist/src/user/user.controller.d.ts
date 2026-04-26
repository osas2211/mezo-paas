import { UserService } from './user.service';
export declare class UserController {
    private readonly user;
    constructor(user: UserService);
    getUserProfile(req: {
        user: {
            userId: string;
        };
    }): Promise<{
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
