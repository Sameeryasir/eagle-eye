import { 
  Body, 
  Controller, 
  Post, 
  Get, 
  Put, 
  Delete, 
  Param, 
  UseGuards, 
  ValidationPipe,
  ParseIntPipe,
  Request,
  BadRequestException
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EventService } from './event.service';
import { CreateEventDto } from './eventDto/create-event.dto';
import { UpdateEventDto } from './eventDto/update-event.dto';

// --- Event Controller ---
// Controller for managing events in the Eagle Eye system
// This follows MCP Context 7 best practices for clean API design

@Controller('event')
export class EventController {
    constructor(private readonly eventService: EventService) {}

    // --- Create Event Endpoint ---
    // Creates a new event with authentication
    @Post('create')
    @UseGuards(AuthGuard('jwt'))
    async createEvent(
        @Body(ValidationPipe) createEventDto: CreateEventDto,
        @Request() req: any
    ) {
        try {
            console.log('📅 Creating event:', createEventDto);
            
            // Extract user ID from JWT token
            const userId = req.user.id;
            console.log('👤 User ID from token:', userId);
            
            if (!userId) {
                throw new BadRequestException('User ID not found in token');
            }

            const event = await this.eventService.createEvent(createEventDto, userId);
            console.log('✅ Event created successfully:', event.id);
            
            return {
                success: true,
                message: 'Event created successfully',
                data: event
            };
        } catch (error) {
            console.error('❌ Error creating event:', error);
            
            // Provide user-friendly error messages
            if (error instanceof BadRequestException) {
                throw error;
            }
            
            // Handle specific error types
            if (error.message?.includes('start time must be in the future')) {
                throw new BadRequestException('Event start time must be in the future');
            }
            
            if (error.message?.includes('end time must be after start time')) {
                throw new BadRequestException('Event end time must be after start time');
            }
            
            // Generic error fallback
            throw new BadRequestException(`Failed to create event: ${error.message || 'Unknown error'}`);
        }
    }

    // --- Get User's Events Endpoint ---
    // Retrieves all events for the authenticated user
    @Get()
    @UseGuards(AuthGuard('jwt'))
    async getAllEvents(@Request() req: any) {
        try {
            const userId = req.user.id;
            
            if (!userId) {
                throw new Error('User ID not found in token');
            }

            const events = await this.eventService.getEventsByUser(userId);
            return {
                success: true,
                message: 'User events retrieved successfully',
                data: events
            };
        } catch (error) {
            throw error;
        }
    }

    // --- Get Events By Date Endpoint ---
    // Retrieves events for a specific date (Owner access only)
    @Get('date/:date')
    @UseGuards(AuthGuard('jwt'))
    async getEventsByDate(@Param('date') date: string, @Request() req: any) {
        try {
            const userId = req.user.id;
            
            if (!userId) {
                throw new Error('User ID not found in token');
            }

           

            const events = await this.eventService.getEventsByDateAndUser(date, userId);
            return {
                success: true,
                message: 'Events retrieved successfully for the specified date',
                data: events
            };
        } catch (error) {
            throw error;
        }
    }

    // --- Update Event Endpoint ---
    // Updates an existing event with proper authorization
    @Put(':id')
    @UseGuards(AuthGuard('jwt'))
    async updateEvent(
        @Param('id', ParseIntPipe) id: number,
        @Body(ValidationPipe) updateData: UpdateEventDto,
        @Request() req: any
    ) {
        try {
            // Extract user ID from JWT token for authorization
            const userId = req.user.id;
            
            if (!userId) {
                throw new BadRequestException('User ID not found in token');
            }

            const event = await this.eventService.updateEvent(id, updateData, userId);
            return {
                success: true,
                message: 'Event updated successfully',
                data: event
            };
        } catch (error) {
            throw error;
        }
    }

    // --- Delete Event Endpoint ---
    // Deletes an event by its ID
    @Delete(':id')
    @UseGuards(AuthGuard('jwt'))
    async deleteEvent(@Param('id', ParseIntPipe) id: number) {
        try {
            await this.eventService.deleteEvent(id);
            return {
                success: true,
                message: 'Event deleted successfully'
            };
        } catch (error) {
            throw error;
        }
    }

    // --- Get Upcoming Events Endpoint ---
    // Retrieves events starting in the next 24 hours
    @Get('upcoming/list')
    @UseGuards(AuthGuard('jwt'))
    async getUpcomingEvents() {
        try {
            const events = await this.eventService.getUpcomingEvents();
            return {
                success: true,
                message: 'Upcoming events retrieved successfully',
                data: events
            };
        } catch (error) {
            throw error;
        }
    }

}
