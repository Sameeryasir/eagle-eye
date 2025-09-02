import { Users } from 'src/entities/users.entity';
import { Repository } from 'typeorm';
import { Otps } from 'src/entities/otps.entity';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private userRepo;
    private otpRepo;
    private jwtService;
    constructor(userRepo: Repository<Users>, otpRepo: Repository<Otps>, jwtService: JwtService);
    private findUserByEmailOrPhone;
    private generateTokens;
    sendOtp(email?: string, phone?: string): Promise<{
        message: string;
    }>;
    verifyOtp(code: string, email?: string, phone?: string): Promise<{
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
    refreshAccessToken(refreshToken: string): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
}
