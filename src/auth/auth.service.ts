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
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Users) private userRepo: Repository<Users>,
    @InjectRepository(Otps) private otpRepo: Repository<Otps>,
    private jwtService: JwtService,
  ) {}

  async sendOtp(email?: string, phone?: string) {
    let user;

    if (email) {
      user = await this.userRepo.findOne({ where: { email } });
    } else if (phone) {
      user = await this.userRepo.findOne({ where: { phone } });
    } else {
      throw new BadRequestException('Email or phone is required');
    }

    if (!user) {
      throw new BadRequestException('please try again ');
    }

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
      // ✅ Send OTP via email
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
        text: `Your verification code is: ${code}`,
        html: `<p>Hello 👋,</p><p>Your OTP code is: <b>${code}</b></p><p>It will expire in 1 minute.</p>`,
      });

      return { message: 'OTP sent to email' };
    }

    // ✅ For phone: just save OTP without sending
    return { message: 'OTP generated and saved for phone number' };
  }

  async verifyOtp(code: string, email?: string, phone?: string) {
    if (!code || (!email && !phone)) {
      throw new BadRequestException(
        'OTP code and either email or phone are required',
      );
    }

    const user = await this.userRepo.findOne({
      where: email ? { email } : { phone },
      relations: ['otp', 'role'],
    });

    if (!user) {
      throw new BadRequestException('Please try again');
    }

    const otp = user.otp;

    if (!otp) {
      throw new BadRequestException('OTP record not found');
    }

    const isExpired = Date.now() - otp.createdAt.getTime() > 60 * 3000;
    if (isExpired || otp.isUsed || otp.code !== code) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    otp.isUsed = true;
    await this.otpRepo.save(otp);

    // Generate access token
    const accessToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email, type: 'access' },
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY },
    );

    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email, type: 'refresh' },
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY },
    );

    await this.userRepo.save(user);

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
    try {
      const payload = this.jwtService.verify(refreshToken);

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      const user = await this.userRepo.findOne({
        where: { id: payload.sub },
        relations: ['role'],
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const newAccessToken = this.jwtService.sign(
        { sub: user.id, email: user.email, type: 'access' },
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY },
      );

      const newRefreshToken = this.jwtService.sign(
        { sub: user.id, email: user.email, type: 'refresh' },
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY },
      );

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
