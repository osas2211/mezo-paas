import { AuthService } from './auth.service';
import { LoginDto, SignUpDto } from './dto/auth-dto';
export declare class AuthController {
    private readonly auth;
    constructor(auth: AuthService);
    createUser(body: SignUpDto): Promise<{
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
