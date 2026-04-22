import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'usuario@example.com',
    description: 'Email único del usuario (debe ser válido)',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre completo del usuario (mínimo 2 caracteres)',
  })
  @IsString()
  @MinLength(2)
  nombre: string;

  @ApiProperty({
    example: 'SecurePassword123',
    description: 'Contraseña del usuario (mínimo 6 caracteres)',
    format: 'password',
  })
  @Transform(({ value, obj }) => value ?? obj?.contraseña)
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID del rol a asignar. Si no se proporciona, se asigna DESARROLLADOR por defecto.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  rolId?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Estado del usuario. Por defecto: activo',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
