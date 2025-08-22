import { IsString, IsOptional, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateLogDto {
  @IsString()
  @IsOptional()
  note?: string;

  @IsNumber()
  @IsNotEmpty()
  task_id: number;
}
