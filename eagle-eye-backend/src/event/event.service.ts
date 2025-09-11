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

  
  async updateEvent(id: number, updateData: UpdateEventDto): Promise<Events> {
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
      if (updateData.startTime) {
        const startTime = new Date(updateData.startTime);
        console.log('⏰ Updating start time:', startTime.toISOString());
        event.startTime = startTime;
      }
      if (updateData.endTime !== undefined) {
        event.endTime = updateData.endTime ? new Date(updateData.endTime) : undefined;
        console.log('⏰ Updating end time:', event.endTime?.toISOString() || 'undefined');
        
        // Validate end time is after start time
        if (event.endTime && event.startTime && event.endTime <= event.startTime) {
          throw new BadRequestException('Event end time must be after start time');
        }
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
