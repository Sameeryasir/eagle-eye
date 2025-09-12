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
const brevo = require("@getbrevo/brevo");
const nodemailer = require("nodemailer");
require("dotenv/config");
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
            console.log('🔧 Initializing SMTP fallback...');
            const smtpUsername = process.env.MAIL_USERNAME;
            const smtpPassword = process.env.MAIL_PASSWORD;
            const smtpHost = process.env.MAIL_HOST;
            const smtpPort = process.env.MAIL_PORT;
            console.log('📧 SMTP configuration:', {
                host: smtpHost || 'smtp-relay.brevo.com',
                port: smtpPort || '587',
                username: smtpUsername ? `${smtpUsername.substring(0, 3)}***` : 'NOT SET',
                password: smtpPassword ? '***SET***' : 'NOT SET',
                toEmail: email
            });
            if (!smtpUsername || !smtpPassword) {
                console.error('❌ SMTP email credentials not configured');
                throw new Error('SMTP credentials not configured');
            }
            const transporter = nodemailer.createTransport({
                host: process.env.MAIL_HOST || 'smtp-relay.brevo.com',
                port: parseInt(process.env.MAIL_PORT || '587'),
                secure: process.env.MAIL_ENCRYPTION === 'ssl',
                auth: {
                    user: process.env.MAIL_USERNAME,
                    pass: process.env.MAIL_PASSWORD,
                },
            });
            console.log('📤 Sending email via SMTP...');
            const result = await transporter.sendMail({
                from: `"${process.env.MAIL_FROM_NAME || 'Eagle Eye'}" <${process.env.MAIL_FROM_ADDRESS}>`,
                to: email,
                subject: 'Your Eagle Eye OTP Code',
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">${process.env.MAIL_FROM_NAME || 'Eagle Eye'} OTP Verification</h2>
            <p>Hello,</p>
            <p>Your OTP code for ${process.env.MAIL_FROM_NAME || 'Eagle Eye'} is:</p>
            <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${code}</h1>
            </div>
            <p>This code will expire in 15 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
            <hr style="margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">This is an automated message from ${process.env.MAIL_FROM_NAME || 'Eagle Eye'}.</p>
          </div>
        `,
            });
            console.log('📨 SMTP response:', result);
            console.log(`✅ OTP email sent successfully to ${email} via SMTP`);
        }
        catch (error) {
            console.error(`Failed to send OTP email to ${email}:`, error);
        }
    }
    async sendOtp(email, phone) {
        try {
            if (!email && !phone) {
                throw new common_1.BadRequestException('Either email or phone must be provided');
            }
            const user = await this.findUserByEmailOrPhone(email, phone);
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            if (email) {
                try {
                    console.log('🚀 Attempting to send email via Brevo to:', email);
                    await this.sendEmailViaBrevo(email, code);
                    console.log('✅ Email sent successfully via Brevo');
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
                    console.log(`OTP ${code} generated and saved after successful email delivery to ${email}`);
                    return { message: 'OTP sent to email successfully' };
                }
                catch (emailError) {
                    console.error('❌ Error sending email via Brevo:', emailError);
                    try {
                        console.log('🔄 Attempting fallback SMTP method...');
                        await this.sendEmailAsync(email, code);
                        console.log('✅ Email sent successfully via SMTP fallback');
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
                        console.log(`OTP ${code} generated and saved after successful email delivery via SMTP to ${email}`);
                        return { message: 'OTP sent to email successfully (via SMTP fallback)' };
                    }
                    catch (smtpError) {
                        console.error('❌ SMTP fallback also failed:', smtpError);
                        throw new common_1.BadRequestException(`Failed to send email via both Brevo API and SMTP. Please check your email configuration. Error: ${emailError.message}`);
                    }
                }
            }
            else {
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
                return { message: 'OTP generated and saved for phone number' };
            }
        }
        catch (error) {
            console.error('Error in sendOtp:', error);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            if (error.message?.includes('User not found')) {
                throw new common_1.BadRequestException('User not found with the provided email or phone');
            }
            if (error.message?.includes('BREVO_API_KEY')) {
                throw new common_1.BadRequestException('Email service configuration error. Please contact support.');
            }
            if (error.message?.includes('MAIL_FROM_ADDRESS')) {
                throw new common_1.BadRequestException('Email service configuration error. Please contact support.');
            }
            throw new common_1.BadRequestException(`Failed to send OTP: ${error.message || 'Unknown error'}`);
        }
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
    async sendEmailViaBrevo(email, otpCode) {
        try {
            console.log('🔧 Initializing Brevo API client...');
            const apiInstance = new brevo.TransactionalEmailsApi();
            const apiKey = process.env.BREVO_API_KEY;
            console.log('🔑 API Key present:', !!apiKey);
            if (!apiKey) {
                throw new Error('BREVO_API_KEY environment variable is not set');
            }
            apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);
            console.log('✅ API key set successfully');
            console.log('🧪 Testing Brevo API key...');
            try {
                const testResponse = await apiInstance.getTransacEmailContent('test');
                console.log('✅ Brevo API key is valid and working');
            }
            catch (testError) {
                console.log('⚠️ Brevo API key test failed:', testError.message);
            }
            const fromName = process.env.MAIL_FROM_NAME || 'Eagle Eye';
            const fromAddress = process.env.MAIL_FROM_ADDRESS;
            console.log('📧 Email configuration:', {
                fromName,
                fromAddress: fromAddress ? `${fromAddress.substring(0, 3)}***` : 'NOT SET',
                toEmail: email
            });
            if (!fromAddress) {
                throw new Error('MAIL_FROM_ADDRESS environment variable is not set');
            }
            const emailContent = {
                sender: {
                    name: fromName,
                    email: fromAddress
                },
                to: [
                    {
                        email: email,
                        name: 'User'
                    }
                ],
                subject: `${fromName} OTP Verification`,
                htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2c3e50; margin: 0;">${fromName}</h1>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #333; margin-top: 0;">OTP Verification</h2>
              <p style="font-size: 16px; color: #555;">Hello,</p>
              <p style="font-size: 16px; color: #555;">Your OTP code for ${fromName} is:</p>
              
              <div style="background-color: #ffffff; padding: 25px; text-align: center; margin: 25px 0; border: 2px dashed #007bff; border-radius: 8px;">
                <h1 style="color: #007bff; font-size: 36px; margin: 0; letter-spacing: 8px; font-weight: bold;">${otpCode}</h1>
              </div>
              
              <p style="font-size: 14px; color: #666; text-align: center;">
                ⏰ This code will expire in <strong>15 minutes</strong>
              </p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="font-size: 14px; color: #666; margin: 0;">
                If you didn't request this code, please ignore this email.
              </p>
              <p style="font-size: 12px; color: #999; margin: 10px 0 0 0;">
                This is an automated message from ${fromName}.
              </p>
            </div>
          </div>
        `,
                textContent: `
${fromName} OTP Verification

Hello,

Your OTP code for ${fromName} is: ${otpCode}

This code will expire in 15 minutes.

If you didn't request this code, please ignore this email.

This is an automated message from ${fromName}.
        `
            };
            console.log('📤 Sending email via Brevo API...');
            const response = await apiInstance.sendTransacEmail(emailContent);
            console.log('📨 Brevo API response:', response);
            console.log(`✅ OTP email sent successfully to ${email} via Brevo API`);
        }
        catch (error) {
            console.error('❌ Brevo API Error Details:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                config: {
                    url: error.config?.url,
                    method: error.config?.method,
                    headers: error.config?.headers ? Object.keys(error.config.headers) : 'No headers'
                }
            });
            if (error.response) {
                console.error('📨 Brevo API Response Data:', error.response.data);
                throw new Error(`Brevo API Error (${error.response.status}): ${error.response.data?.message || JSON.stringify(error.response.data)}`);
            }
            else if (error.request) {
                throw new Error('Brevo API Error: No response received from Brevo servers - check your internet connection and API key');
            }
            else {
                throw new Error(`Brevo API Error: ${error.message}`);
            }
        }
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