import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateStudentDto {
  @ApiProperty({
    description: 'Nombre del estudiante',
    example: 'Juan',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @ApiProperty({
    description: 'Apellido del estudiante',
    example: 'Perez',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  apellido: string;

  @ApiProperty({
    description: 'Codigo unico del estudiante',
    example: 'EST-001',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  codigo: string;
}
