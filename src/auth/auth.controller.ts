import { BadRequestException, Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SendOtpDto } from './authDto/send-otp.dto';
import { VerifyOtpDto } from './authDto/verify-otp.dto';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send-otp')
  async sendOtp(@Body() dto: SendOtpDto) {
    console.log(dto);
    return this.authService.sendOtp(dto.email);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto.email, dto.code);
  }
}
