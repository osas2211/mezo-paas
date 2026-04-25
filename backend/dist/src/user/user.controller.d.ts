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
