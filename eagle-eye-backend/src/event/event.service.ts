import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Events } from '../entities/events.entity';
import { CreateEventDto } from './eventDto/create-event.dto';
import { UpdateEventDto } from './eventDto/update-event.dto';

// --- Event Service ---
// Service for managing events in the Eagle Eye system
// This follows MCP Context 7 best practices for clean, maintainable code

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Events)
    private eventsRepository: Repository<Events>,
  ) {}

  async createEvent(createEventDto: CreateEventDto, userId: number): Promise<Events> {
    try {
      console.log('🔧 Event service - creating event for user:', userId);
      console.log('📅 Event data:', createEventDto);
      
      const startTime = new Date(createEventDto.startTime);
      const now = new Date();
      
      console.log('⏰ Time validation:', {
        startTime: startTime.toISOString(),
        now: now.toISOString(),
        timeDifference: startTime.getTime() - now.getTime(),
        isInFuture: startTime > now
      });
      
      // Allow events to start at any time (including past and present)
      // No time validation - events can be created for any time

      if (createEventDto.endTime) {
        const endTime = new Date(createEventDto.endTime);
        if (endTime <= startTime) {
          throw new BadRequestException('Event end time must be after start time');
        }
      }

      console.log('💾 Creating event entity...');
      const newEvent = this.eventsRepository.create({
        title: createEventDto.title,
        description: createEventDto.description,
        startTime: startTime,
        endTime: createEventDto.endTime ? new Date(createEventDto.endTime) : undefined,
        createdBy: userId, // Set the user who created the event
      });

      console.log('💾 Saving event to database...');
      const savedEvent = await this.eventsRepository.save(newEvent);
      console.log('✅ Event saved successfully with ID:', savedEvent.id);
      
      return savedEvent;
    } catch (error) {
      console.error('❌ Event service error:', error);
      
      // Re-throw known errors, wrap unknown errors
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      // Handle database errors
      if (error.code) {
        console.error('Database error code:', error.code);
        throw new BadRequestException(`Database error: ${error.message}`);
      }
      
      throw new BadRequestException(`Failed to create event: ${error.message || 'Unknown error'}`);
    }
  }

  // --- Get All Events Method ---
  // Retrieves all events ordered by start time
  async getAllEvents(): Promise<Events[]> {
    try {
      return await this.eventsRepository.find({
        order: {
          startTime: 'ASC',
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to retrieve events');
    }
  }

  // --- Get Event By ID Method ---
  // Retrieves a specific event by its ID
  async getEventById(id: number): Promise<Events> {
    try {
      const event = await this.eventsRepository.findOne({
        where: { id },
      });

      if (!event) {
        throw new BadRequestException('Event not found');
      }

      return event;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve event');
    }
  }

  
  // --- Update Event Method ---
  // Updates an existing event with proper validation and authorization
  // This follows MCP Context 7 best practices for secure, maintainable code
  async updateEvent(id: number, updateData: UpdateEventDto, userId: number): Promise<Events> {
    try {
      console.log('🔧 Event service - updating event:', id);
      console.log('📅 Update data:', updateData);
      
      const event = await this.eventsRepository.findOne({
        where: { id },
      });

      if (!event) {
        throw new BadRequestException('Event not found');
      }

      // Update fields if provided
      if (updateData.title) {
        event.title = updateData.title;
      }
      if (updateData.description !== undefined) {
        event.description = updateData.description;
      }
      // --- Handle Start Time Update ---
      if (updateData.startTime) {
        const startTime = this.parseAndValidateDate(updateData.startTime, 'start time');
        console.log('⏰ Updating start time:', startTime.toISOString());
        console.log('⏰ Start time local:', startTime.toLocaleString());
        event.startTime = startTime;
      }
      
      // --- Handle End Time Update ---
      if (updateData.endTime !== undefined) {
        event.endTime = updateData.endTime ? this.parseAndValidateDate(updateData.endTime, 'end time') : undefined;
        console.log('⏰ Updating end time:', event.endTime?.toISOString() || 'undefined');
        console.log('⏰ End time local:', event.endTime?.toLocaleString() || 'undefined');
      }

      // --- Final Time Validation ---
      // Validate end time is after start time (using updated values)
      if (event.endTime && event.startTime && event.endTime <= event.startTime) {
        console.log('❌ Time validation failed:');
        console.log('   Start:', event.startTime.toISOString(), '(', event.startTime.toLocaleString(), ')');
        console.log('   End:', event.endTime.toISOString(), '(', event.endTime.toLocaleString(), ')');
        throw new BadRequestException('Event end time must be after start time');
      }

      console.log('💾 Saving updated event...');
      const updatedEvent = await this.eventsRepository.save(event);
      console.log('✅ Event updated successfully with ID:', updatedEvent.id);
      
      return updatedEvent;
    } catch (error) {
      console.error('❌ Event service update error:', error);
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      // Handle database errors
      if (error.code) {
        console.error('Database error code:', error.code);
        throw new BadRequestException(`Database error: ${error.message}`);
      }
      
      throw new BadRequestException(`Failed to update event: ${error.message || 'Unknown error'}`);
    }
  }

  // --- Date Parsing and Validation Helper Method ---
  // Safely parses date strings and validates them
  private parseAndValidateDate(dateString: string, fieldName: string): Date {
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        throw new BadRequestException(`Invalid ${fieldName} format. Please use ISO date format (e.g., 2024-01-15T10:00:00.000Z)`);
      }
      
      // Check if date is too far in the past (optional business rule)
      const now = new Date();
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      if (date < oneYearAgo) {
        console.log(`⚠️ Warning: ${fieldName} is more than 1 year in the past`);
      }
      
      // Check if date is too far in the future (optional business rule)
      const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
      if (date > oneYearFromNow) {
        console.log(`⚠️ Warning: ${fieldName} is more than 1 year in the future`);
      }
      
      return date;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Invalid ${fieldName} format: ${error.message}`);
    }
  }

  async deleteEvent(id: number): Promise<void> {
    try {
      const event = await this.eventsRepository.findOne({
        where: { id },
      });

      if (!event) {
        throw new BadRequestException('Event not found');
      }

      await this.eventsRepository.remove(event);
      
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete event');
    }
  }

 
  async getUpcomingEvents(): Promise<Events[]> {
    try {
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      return await this.eventsRepository.find({
        where: {
          startTime: Between(now, tomorrow),
        },
        order: {
          startTime: 'ASC',
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to retrieve upcoming events');
    }
  }

  // --- Get Events By User Method ---
  // Retrieves all events created by a specific user
  async getEventsByUser(userId: number): Promise<Events[]> {
    try {
      return await this.eventsRepository.find({
        where: {
          createdBy: userId,
        },
        order: {
          startTime: 'ASC',
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to retrieve user events');
    }
  }

  // --- Get Events By Date Method ---
  // Retrieves all events for a specific date
  async getEventsByDate(date: string): Promise<Events[]> {
    try {
      // Parse the date string and create start and end of day
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      return await this.eventsRepository.find({
        where: {
          startTime: Between(startOfDay, endOfDay),
        },
        order: {
          startTime: 'ASC',
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to retrieve events for the specified date');
    }
  }

  // --- Get Events By Date And User Method ---
  // Retrieves events created on a specific date by a specific user
  async getEventsByDateAndUser(date: string, userId: number): Promise<Events[]> {
    try {
      // Parse the date string and create start and end of day
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      return await this.eventsRepository.find({
        where: {
          startTime: Between(startOfDay, endOfDay), // Filter by start time, not creation date
          createdBy: userId, // Filter by user who created the event
        },
        order: {
          startTime: 'ASC', // Order by start time
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to retrieve user events created on the specified date');
    }
  }
}
