import { AuthService } from './auth.service';
import { SendOtpDto } from './authDto/send-otp.dto';
import { VerifyOtpDto } from './authDto/verify-otp.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    getHelloworld(): Promise<{
        messege: string;
    }>;
    sendOtp(dto: SendOtpDto): Promise<{
        message: string;
        otp: string;
        email: string;
    } | {
        message: string;
        otp?: undefined;
        email?: undefined;
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
    verifyToken(req: any): Promise<{
        success: boolean;
        message: string;
        user: {
            id: any;
            email: any;
            phone: any;
            name: any;
        };
    }>;
}
