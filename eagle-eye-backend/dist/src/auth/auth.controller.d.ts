import { AuthService } from './auth.service';
import { SendOtpDto } from './authDto/send-otp.dto';
import { VerifyOtpDto } from './authDto/verify-otp.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    sendOtp(dto: SendOtpDto): Promise<{
        message: string;
    }>;
    verifyOtp(dto: VerifyOtpDto): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: number;
            email: string;
            first_name: string;
            last_name: string;
            phone: string;
            role: import("../entities/roles.entity").Roles;
        };
    }>;
    refreshToken(refreshToken: string): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
}
