import { IsString, IsOptional, IsNotEmpty, IsNumber, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateLogDto {
  @IsString()
  @IsOptional()
  note?: string;

  @Transform(({ value }) => Array.isArray(value) ? value : [value])
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  task_id: number | number[];
}
