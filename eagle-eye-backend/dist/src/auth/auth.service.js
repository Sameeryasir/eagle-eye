"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const users_entity_1 = require("../entities/users.entity");
const typeorm_2 = require("typeorm");
const otps_entity_1 = require("../entities/otps.entity");
const jwt_1 = require("@nestjs/jwt");
const nodemailer = require("nodemailer");
let AuthService = class AuthService {
    userRepo;
    otpRepo;
    jwtService;
    constructor(userRepo, otpRepo, jwtService) {
        this.userRepo = userRepo;
        this.otpRepo = otpRepo;
        this.jwtService = jwtService;
    }
    async findUserByEmailOrPhone(email, phone) {
        const user = await this.userRepo.findOne({
            where: email ? { email } : { phone },
            relations: ['otp', 'role'],
        });
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        return user;
    }
    async generateTokens(user) {
        const accessToken = await this.jwtService.signAsync({ sub: user.id, email: user.email, type: 'access' }, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });
        const refreshToken = await this.jwtService.signAsync({ sub: user.id, email: user.email, type: 'refresh' }, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY });
        return { accessToken, refreshToken };
    }
    async sendEmailAsync(email, code) {
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });
            await transporter.sendMail({
                from: `"My App" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Your OTP Code',
                html: `<p>Hello 👋,</p><p>Your OTP code is: <b>${code}</b></p><p>It will expire in 15 minutes.</p>`,
            });
            console.log(`OTP email sent successfully to ${email}`);
        }
        catch (error) {
            console.error(`Failed to send OTP email to ${email}:`, error);
        }
    }
    async sendOtp(email, phone) {
        const user = await this.findUserByEmailOrPhone(email, phone);
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        let otp = await this.otpRepo.findOne({ where: { user: { id: user.id } } });
        if (otp) {
            otp.code = code;
            otp.isUsed = false;
            otp.createdAt = new Date();
        }
        else {
            otp = this.otpRepo.create({ code, user });
        }
        await this.otpRepo.save(otp);
        if (email) {
            this.sendEmailAsync(email, code);
            return { message: 'OTP sent to email' };
        }
        return { message: 'OTP generated and saved for phone number' };
    }
    async verifyOtp(code, email, phone) {
        if (!code || (!email && !phone)) {
            throw new common_1.BadRequestException('OTP code and either email or phone are required');
        }
        const user = await this.findUserByEmailOrPhone(email, phone);
        const otp = user.otp;
        if (!otp)
            throw new common_1.BadRequestException('OTP record not found');
        if (otp.isUsed)
            throw new common_1.BadRequestException('OTP has already been used. Please request a new one.');
        if (otp.code !== code)
            throw new common_1.BadRequestException('Invalid OTP code');
        if (!otp.createdAt)
            throw new common_1.BadRequestException('OTP creation time missing');
        const now = new Date();
        const otpCreatedAt = new Date(otp.createdAt);
        const timeDifferenceMs = now.getTime() - otpCreatedAt.getTime();
        const fifteenMinutesMs = 15 * 60 * 1000;
        console.log('Debug OTP timing:', {
            now: now.toISOString(),
            otpCreatedAt: otpCreatedAt.toISOString(),
            timeDifferenceMs,
            fifteenMinutesMs,
            isExpired: timeDifferenceMs > fifteenMinutesMs,
            minutesPassed: Math.round(timeDifferenceMs / 1000 / 60),
        });
        if (timeDifferenceMs > fifteenMinutesMs) {
            throw new common_1.BadRequestException(`OTP has expired. Time difference: ${Math.round(timeDifferenceMs / 1000 / 60)} minutes`);
        }
        otp.isUsed = true;
        await this.otpRepo.save(otp);
        const { accessToken, refreshToken } = await this.generateTokens(user);
        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                phone: user.phone,
                role: user.role,
            },
        };
    }
    async refreshAccessToken(refreshToken) {
        let payload;
        try {
            payload = await this.jwtService.verifyAsync(refreshToken);
        }
        catch (err) {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
        if (payload.type === 'access') {
            throw new common_1.UnauthorizedException('Invalid token');
        }
        if (payload.type !== 'refresh') {
            throw new common_1.UnauthorizedException('Invalid token type');
        }
        const user = await this.userRepo.findOne({
            where: { id: payload.sub },
            relations: ['role'],
        });
        if (!user) {
            throw new common_1.UnauthorizedException('not found');
        }
        const { accessToken, refreshToken: newRefreshToken } = await this.generateTokens(user);
        return {
            access_token: accessToken,
            refresh_token: newRefreshToken,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(users_entity_1.Users)),
    __param(1, (0, typeorm_1.InjectRepository)(otps_entity_1.Otps)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map