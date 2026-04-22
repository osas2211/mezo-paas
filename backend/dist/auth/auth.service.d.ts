import { LoginDto } from './dto/auth-dto';
export declare class AuthService {
    login(body: LoginDto): Promise<{
        message: string;
        email: string;
    }>;
}
