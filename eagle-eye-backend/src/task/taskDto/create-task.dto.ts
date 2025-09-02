import { IsOptional, IsString, IsNotEmpty, IsDateString, IsInt, IsEnum } from 'class-validator';
import { TaskPriority } from 'src/entities/tasks.entity';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  startTime?: string;

  // Optional anchor captured by frontend when draft opened; backend will ensure
  // startTime is not before this, instead of comparing to server "now"
  @IsOptional()
  @IsDateString()
  minStartTime?: string;

  @IsOptional()
  @IsDateString()
  endTime?: string;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @IsInt()
  projectId?: number;

  @IsOptional()
  @IsInt()
  assignedToUserId?: number;
}
