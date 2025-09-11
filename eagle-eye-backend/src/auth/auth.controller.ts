import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SendOtpDto } from './authDto/send-otp.dto';
import { VerifyOtpDto } from './authDto/verify-otp.dto';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('helloworld')
  async getHelloworld() {
    return { messege: 'helloworld' };
  }
  @Post('send-otp')
  async sendOtp(@Body(ValidationPipe) dto: SendOtpDto) {
    console.log('📧 Send OTP Request:', dto);
    
    try {
      const result = await this.authService.sendOtp(dto.email, dto.phone);
      console.log('✅ OTP sent successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Error in sendOtp controller:', error);
      throw error; // Re-throw to let NestJS handle the response
    }
  }

  @Post('verify-otp')
  async verifyOtp(@Body(ValidationPipe) dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto.code, dto.email, dto.phone);
  }
  @Post('refresh-token')
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }

    return this.authService.refreshAccessToken(refreshToken);
  }
}
