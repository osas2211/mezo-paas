import { AuthService } from './auth.service';
import { LoginDto, SignUpDto } from './dto/auth-dto';
export declare class AuthController {
    private readonly auth;
    constructor(auth: AuthService);
    createUser(body: SignUpDto): Promise<{
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
