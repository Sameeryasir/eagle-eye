import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { Otp } from 'src/entities/otp.entity';
import { JwtService } from '@nestjs/jwt';
import * as nodemailer from 'nodemailer';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Otp) private otpRepo: Repository<Otp>,
    private jwtService: JwtService,
  ) {}

  async sendOtp(email: string) {
    let user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('User not found');
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

    // ✅ Setup nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // ✅ Send the OTP email
    await transporter.sendMail({
      from: `"My App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your OTP Code',
      text: `Your verification code is: ${code}`,
      html: `<p>Hello 👋,</p><p>Your OTP code is: <b>${code}</b></p><p>It will expire in 1 minute.</p>`,
    });

    return { message: 'OTP sent to email' };
  }
  async verifyOtp(email: string, code: string) {
    // Add input validation
    if (!email || !code) {
      throw new BadRequestException('Email and OTP code are required');
    }

    const user = await this.userRepo.findOne({
      where: { email },
      relations: ['otp'],
    });
    console.log(user);

    if (!user || !user.otp) return null;

    const otp = user.otp;
    const isExpired = Date.now() - otp.createdAt.getTime() > 60 * 1000;
    if (isExpired || otp.isUsed || otp.code !== code) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    otp.isUsed = true;
    await this.otpRepo.save(otp);

    const token = this.jwtService.sign({ email: user.email, sub: user.id });

    return { access_token: token };
  }
}
