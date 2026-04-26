import { AuthService } from './auth.service';
import { LoginDto, SignUpDto } from './dto/auth-dto';
export declare class AuthController {
    private readonly auth;
    constructor(auth: AuthService);
    createUser(body: SignUpDto): Promise<{
        message: string;
        user: {
            name: string;
            password: string;
            email: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    login(body: LoginDto): Promise<{
        message: string;
        user: {
            wallet: {
                address: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                encryptedPK: string;
                encryptedMnemonic: string;
                balance: string;
                userId: string;
            } | null;
            name: string;
            email: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        };
        access_token: string;
    }>;
}
