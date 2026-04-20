import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ description: 'Título de la tarea', example: 'Diseñar base de datos' })
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiPropertyOptional({ description: 'Descripción detallada de la tarea' })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({ format: 'uuid', description: 'ID del proyecto al que pertenece la tarea' })
  @IsUUID()
  @IsNotEmpty()
  idProyecto: string;
}