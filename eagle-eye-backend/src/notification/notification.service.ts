import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { expoTokens } from '../entities/expoTokens.entity';
import { Users } from '../entities/users.entity';
import { Tasks } from '../entities/tasks.entity';
import axios from 'axios';
import { SaveTokenDto } from './notificationDto/save-token.dto';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(expoTokens)
    private expoTokensRepository: Repository<expoTokens>,
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
    @InjectRepository(Tasks)
    private taskRepository: Repository<Tasks>,
  ) {}

  // --- Save Expo Push Token Method ---
  // Saves or updates expo push token for authenticated user
  // Business Logic: Each user can have multiple tokens for different devices
  async saveToken(
    userId: number,
    saveTokenDto: SaveTokenDto,
  ): Promise<expoTokens> {
    try {
      // Validate expo push token format
      if (
        !saveTokenDto.expoPushToken ||
        !saveTokenDto.expoPushToken.startsWith('ExponentPushToken')
      ) {
        throw new BadRequestException('Invalid Expo push token format');
      }

      // Check if user exists
      const user = await this.usersRepository.findOne({
        where: { id: userId },
      });
      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Create new token entry (allow multiple tokens per user)
      const newToken = this.expoTokensRepository.create({
        userId: userId,
        expoPushToken: saveTokenDto.expoPushToken,
        platform: saveTokenDto.platform || 'ios', // Default to iOS
        deviceType: saveTokenDto.deviceType || 'mobile', // Default to mobile
        isActive: true,
      });

      return await this.expoTokensRepository.save(newToken);
    } catch (error) {
      // Re-throw known errors, wrap unknown errors
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to save expo push token');
    }
  }

  // --- Get User Tokens Method ---
  // Retrieves all active expo push tokens for a user
  async getUserTokens(userId: number): Promise<expoTokens[]> {
    try {
      return await this.expoTokensRepository.find({
        where: {
          userId: userId,
          isActive: true,
        },
        order: {
          createdAt: 'DESC',
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to retrieve user tokens');
    }
  }

  // --- Deactivate Token Method ---
  // Deactivates a specific expo push token
  async deactivateToken(userId: number, tokenId: number): Promise<void> {
    try {
      const token = await this.expoTokensRepository.findOne({
        where: {
          id: tokenId,
          userId: userId,
        },
      });

      if (!token) {
        throw new BadRequestException('Token not found');
      }

      token.isActive = false;
      token.updatedAt = new Date();
      await this.expoTokensRepository.save(token);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to deactivate token');
    }
  }

  // --- Remove Token Method ---
  // Removes all expo push tokens for a specific user
  // This follows MCP Context 7 best practices for clean, simple token management
  async removeToken(userId: number): Promise<void> {
    try {
      // Check if user exists
      const user = await this.usersRepository.findOne({
        where: { id: userId },
      });
      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Find all tokens for this user (both active and inactive)
      const userTokens = await this.expoTokensRepository.find({
        where: {
          userId: userId,
        },
      });

      if (userTokens.length === 0) {
        // No tokens found, but this is not an error
        return;
      }

      // Actually delete all tokens for this user from the database
      await this.expoTokensRepository.remove(userTokens);
    } catch (error) {
      // Re-throw known errors, wrap unknown errors
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to remove expo push tokens');
    }
  }

  // --- Remove Token By ID Method ---
  // Removes a specific expo push token by its ID
  // This follows MCP Context 7 best practices for clean, simple token management
  async removeTokenById(tokenId: number): Promise<void> {
    try {
      // Find the specific token by ID
      const token = await this.expoTokensRepository.findOne({
        where: { id: tokenId },
      });

      if (!token) {
        throw new BadRequestException('Token not found');
      }

      // Delete the specific token from the database
      await this.expoTokensRepository.remove(token);
    } catch (error) {
      // Re-throw known errors, wrap unknown errors
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to remove expo push token');
    }
  }

  // --- Send Expo Push Notification ---
  // Sends push notification using Expo Push API
  // This follows MCP Context 7 best practices for external API integration
  private async sendExpoPushNotification(notification: any) {
    try {
      const response = await axios.post(
        'https://exp.host/--/api/v2/push/send',
        notification,
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'Accept-Encoding': 'gzip, deflate',
          },
          timeout: 10000, // 10 second timeout
        },
      );

      if (response.data.data && response.data.data.length > 0) {
        // Check for any errors in the response
        const errors = response.data.data.filter(
          (result: any) => result.status === 'error',
        );
        if (errors.length > 0) {
          this.logger.warn(`Some notifications failed to send:`, errors);
        }
      }

      this.logger.log('Expo push notification sent successfully');
    } catch (error) {
      this.logger.error('Error sending Expo push notification:', error);
      throw error;
    }
  }

  // --- Send Test Notification to User ---
  // Sends test notification to a specific user by fetching their tokens
  // This follows MCP Context 7 best practices for error handling and logging
  async sendTestNotificationToUser(userId: number) {
    try {
      // Fetch expo tokens for the authenticated user
      const tokens = await this.expoTokensRepository.find({
        where: {
          userId: userId,
          isActive: true,
        },
      });

      if (tokens.length === 0) {
        this.logger.warn(`User ${userId} has no active expo push tokens`);
        return false;
      }

      // Fetch user details
      const user = await this.usersRepository.findOne({
        where: { id: userId },
        select: ['email', 'first_name', 'last_name'],
      });

      const userName = user
        ? `${user.first_name || ''} ${user.last_name || ''}`.trim() ||
          user.email
        : 'User';

      // Prepare notification message
      const currentTime = new Date();
      const localTime = currentTime.toLocaleString();

      const notificationMessage = {
        to: tokens.map((token) => token.expoPushToken),
        title: 'Test Notification - Eagle Eye',
        body: `Hello ${userName}! This is a test notification sent at ${localTime}`,
        data: {
          type: 'test',
          timestamp: currentTime.toISOString(),
          localTime: localTime,
          userId: userId,
          userName: userName,
          tokenCount: tokens.length,
        },
        sound: 'default',
        priority: 'normal',
      };

      // Send notification via Expo Push API
      await this.sendExpoPushNotification(notificationMessage);

      this.logger.log(
        `Test notification sent to user ${userId} (${userName}) with ${tokens.length} tokens`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Error sending test notification to user ${userId}:`,
        error,
      );
      throw error;
    }
  }

  // --- Manual Test Notification ---
  // Method to manually trigger test notification to all users
  // This follows MCP Context 7 best practices for testing and debugging
  async manualTestNotification(): Promise<void> {
    try {
      this.logger.log('Running manual test notification...');

      // Get all active expo push tokens
      const activeTokens = await this.expoTokensRepository.find({
        where: {
          isActive: true,
        },
        relations: ['user'],
      });

      this.logger.log(`Found ${activeTokens.length} active expo push tokens`);

      if (activeTokens.length === 0) {
        this.logger.warn('No active expo push tokens found');
        return;
      }

      // Send one test notification using all available tokens
      await this.sendSingleTestNotification(activeTokens);

      this.logger.log('Manual test notification completed successfully');
    } catch (error) {
      this.logger.error('Error in manual test notification:', error);
      throw error;
    }
  }

  // --- Send Single Test Notification ---
  // Sends one test notification using all available tokens
  // This follows MCP Context 7 best practices for error handling and logging
  private async sendSingleTestNotification(tokens: expoTokens[]) {
    try {
      // Prepare notification message
      const currentTime = new Date();
      const localTime = currentTime.toLocaleString();

      const notificationMessage = {
        to: tokens.map((token) => token.expoPushToken),
        title: 'Test Notification - Eagle Eye',
        body: `This is a test notification sent at ${localTime}`,
        data: {
          type: 'test',
          timestamp: currentTime.toISOString(),
          localTime: localTime,
          totalTokens: tokens.length,
        },
        sound: 'default',
        priority: 'normal',
      };

      // Send notification via Expo Push API
      await this.sendExpoPushNotification(notificationMessage);

      this.logger.log(
        `Single test notification sent to ${tokens.length} tokens`,
      );
    } catch (error) {
      this.logger.error(`Error sending single test notification:`, error);
    }
  }

  // --- Task Reminder Cron Job ---
  // Runs every minute to check for tasks starting in 10 minutes
  // This follows MCP Context 7 best practices for scheduled tasks
  @Cron('* * * * *') // Every minute
  async checkUpcomingTasks() {
    try {
      this.logger.log('Running task reminder cron job...');

      // Calculate time range (9-11 minutes from now)
      const now = new Date();
      const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);
      const nineMinutesFromNow = new Date(now.getTime() + 9 * 60 * 1000);

      // Find tasks starting in this time range
      const upcomingTasks = await this.taskRepository.find({
        where: {
          startTime: Between(nineMinutesFromNow, tenMinutesFromNow),
        },
        relations: ['assignedTo'], // Get the assigned user
      });

      this.logger.log(`Found ${upcomingTasks.length} tasks starting soon`);

      // For each upcoming task
      for (const task of upcomingTasks) {
        const assignedUserId = task.assignedTo?.id;

        if (!assignedUserId) {
          this.logger.warn(`Task ${task.id} has no assigned user`);
          continue;
        }

        // Get tokens ONLY for this specific user
        const userTokens = await this.expoTokensRepository.find({
          where: {
            userId: assignedUserId,
            isActive: true,
          },
        });

        // Send notification to all of this user's devices
        if (userTokens.length > 0) {
          await this.sendTaskReminderNotification(userTokens, task);
          this.logger.log(
            `Sent reminder for task "${task.title}" to user ${assignedUserId}`,
          );
        } else {
          this.logger.warn(
            `User ${assignedUserId} has no active tokens for task "${task.title}"`,
          );
        }
      }

      this.logger.log('Task reminder cron job completed');
    } catch (error) {
      this.logger.error('Error in task reminder cron job:', error);
    }
  }

  // --- Send Task Reminder Notification ---
  // Sends notification to user's devices about upcoming task
  private async sendTaskReminderNotification(
    tokens: expoTokens[],
    task: Tasks,
  ) {
    try {
      const notificationMessage = {
        to: tokens.map((token) => token.expoPushToken),
        title: 'Eagle Eye',
        body: `Your task "${task.title}" starts in 10 minutes!`,
        data: {
          type: 'task_reminder',
          taskId: task.id,
          taskTitle: task.title,
          startTime: task.startTime.toISOString(),
          priority: task.priority,
        },
        sound: 'default',
        priority: 'high',
      };

      await this.sendExpoPushNotification(notificationMessage);
    } catch (error) {
      this.logger.error('Error sending task reminder notification:', error);
    }
  }
}
