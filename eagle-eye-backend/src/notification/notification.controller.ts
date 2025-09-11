import { 
  Body, 
  Controller, 
  Post, 
  Get, 
  Delete, 
  Param, 
  UseGuards, 
  Request, 
  ValidationPipe,
  BadRequestException 
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { SaveTokenDto } from './notificationDto/save-token.dto';
import { AuthGuard } from '@nestjs/passport';

// --- Notification Controller ---
// Controller for handling expo push token management
// This follows MCP Context 7 best practices for clean, secure API endpoints

@Controller('notification')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
  ) {}

  // --- Save Token Endpoint ---
  // POST /notification/save-token
  // Accepts expo push token from frontend and saves it for the authenticated user
  @Post('save-token')
  @UseGuards(AuthGuard('jwt'))
  async saveToken(
    @Body(ValidationPipe) saveTokenDto: SaveTokenDto,
    @Request() req: any
  ) {
    try {
      // Extract user ID from JWT token
      const userId = req.user.id;
      
      if (!userId) {
        throw new BadRequestException('User ID not found in token');
      }

      // Save the expo push token for the authenticated user
      const savedToken = await this.notificationService.saveToken(userId, saveTokenDto);
      
      return {
        success: true,
        message: 'Expo push token saved successfully',
        data: {
          id: savedToken.id,
          expoPushToken: savedToken.expoPushToken,
          platform: savedToken.platform,
          deviceType: savedToken.deviceType,
          isActive: savedToken.isActive,
          createdAt: savedToken.createdAt
        }
      };
    } catch (error) {
      // Handle validation and business logic errors
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to save expo push token');
    }
  }

  // --- Remove Token Endpoint ---
  // DELETE /notification/remove-token/:tokenId
  // Removes a specific expo push token by its ID
  @Delete('remove-token/:tokenId')
  async removeToken(
    @Param('tokenId') tokenId: string
  ) {
    try {
      // Convert tokenId parameter to number
      const tokenIdNumber = parseInt(tokenId, 10);
      if (isNaN(tokenIdNumber)) {
        throw new BadRequestException('Invalid token ID');
      }

      // Remove the specific expo push token
      await this.notificationService.removeTokenById(tokenIdNumber);
      
      return {
        success: true,
        message: 'Expo push token removed successfully'
      };
    } catch (error) {
      // Handle validation and business logic errors
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to remove expo push token');
    }
  }

  // --- Get User Tokens Endpoint ---
  // GET /notification/tokens
  // Retrieves all active expo push tokens for the authenticated user
  @Get('tokens')
  @UseGuards(AuthGuard('jwt'))
  async getUserTokens(@Request() req: any) {
    try {
      const userId = req.user.id;
      
      if (!userId) {
        throw new BadRequestException('User ID not found in token');
      }

      const tokens = await this.notificationService.getUserTokens(userId);
      
      return {
        success: true,
        message: 'User tokens retrieved successfully',
        data: tokens.map(token => ({
          id: token.id,
          expoPushToken: token.expoPushToken,
          platform: token.platform,
          deviceType: token.deviceType,
          isActive: token.isActive,
          createdAt: token.createdAt,
          updatedAt: token.updatedAt
        }))
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve user tokens');
    }
  }

  // --- Manual Test Notification Endpoint ---
  // POST /notification/send-test
  // Sends test notification to all users with active tokens
  @Post('send-test')
  async sendTestNotification() {
    try {
      await this.notificationService.manualTestNotification();
      
      return {
        success: true,
        message: 'Test notifications sent to all users with active tokens'
      };
    } catch (error) {
      throw new BadRequestException('Failed to send test notifications');
    }
  }
}
