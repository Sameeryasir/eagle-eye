import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/entities/users.entity';
import { Repository } from 'typeorm';
import { Otps } from 'src/entities/otps.entity';
import { JwtService } from '@nestjs/jwt';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Users) private userRepo: Repository<Users>,
    @InjectRepository(Otps) private otpRepo: Repository<Otps>,
    private jwtService: JwtService,
  ) {}

  private async findUserByEmailOrPhone(email?: string, phone?: string) {
    const user = await this.userRepo.findOne({
      where: email ? { email } : { phone },
      relations: ['otp', 'role'],
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  }

  private async generateTokens(user: Users) {
    const accessToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email, type: 'access' },
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY },
    );

    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email, type: 'refresh' },
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY },
    );

    return { accessToken, refreshToken };
  }

  // --- Email Sending Helper Method ---
  // Private method to handle email sending asynchronously
  // This prevents blocking the main OTP flow while email is being sent
  private async sendEmailAsync(email: string, code: string): Promise<void> {
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
    } catch (error) {
      // Log error but don't throw - email failure shouldn't break OTP flow
      // The OTP is already saved to database, so user can still verify
      console.error(`Failed to send OTP email to ${email}:`, error);
    }
  }

  async sendOtp(email?: string, phone?: string) {
    const user = await this.findUserByEmailOrPhone(email, phone);

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    let otp = await this.otpRepo.findOne({ where: { user: { id: user.id } } });

    if (otp) {
      otp.code = code;
      otp.isUsed = false;
      otp.createdAt = new Date();
    } else {
      otp = this.otpRepo.create({ code, user });
    }

    await this.otpRepo.save(otp);

    if (email) {
      // --- Email Sending (Async) ---
      // Send email asynchronously to improve response time
      // User doesn't need to wait for email delivery confirmation
      this.sendEmailAsync(email, code);

      return { message: 'OTP sent to email' };
    }

    return { message: 'OTP generated and saved for phone number' };
  }

  async verifyOtp(code: string, email?: string, phone?: string) {
    if (!code || (!email && !phone)) {
      throw new BadRequestException(
        'OTP code and either email or phone are required',
      );
    }

    const user = await this.findUserByEmailOrPhone(email, phone);

    const otp = user.otp;
    if (!otp) throw new BadRequestException('OTP record not found');
    if (otp.isUsed)
      throw new BadRequestException(
        'OTP has already been used. Please request a new one.',
      );
    if (otp.code !== code) throw new BadRequestException('Invalid OTP code');
    if (!otp.createdAt)
      throw new BadRequestException('OTP creation time missing');

    // Fix the timing calculation - use proper Date objects
    const now = new Date();
    const otpCreatedAt = new Date(otp.createdAt);
    const timeDifferenceMs = now.getTime() - otpCreatedAt.getTime();
    const fifteenMinutesMs = 15 * 60 * 1000; // 15 minutes in milliseconds

    console.log('Debug OTP timing:', {
      now: now.toISOString(),
      otpCreatedAt: otpCreatedAt.toISOString(),
      timeDifferenceMs,
      fifteenMinutesMs,
      isExpired: timeDifferenceMs > fifteenMinutesMs,
      minutesPassed: Math.round(timeDifferenceMs / 1000 / 60),
    });

    if (timeDifferenceMs > fifteenMinutesMs) {
      throw new BadRequestException(
        `OTP has expired. Time difference: ${Math.round(timeDifferenceMs / 1000 / 60)} minutes`,
      );
    }

    // Mark OTP as used
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

  async refreshAccessToken(refreshToken: string) {
    let payload: any;

    try {
      // Decode and verify token
      payload = await this.jwtService.verifyAsync(refreshToken);
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Now check the token type
    if (payload.type === 'access') {
      throw new UnauthorizedException('Invalid token');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    const user = await this.userRepo.findOne({
      where: { id: payload.sub },
      relations: ['role'],
    });

    if (!user) {
      throw new UnauthorizedException('not found');
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await this.generateTokens(user);

    return {
      access_token: accessToken,
      refresh_token: newRefreshToken,
    };
  }
}
