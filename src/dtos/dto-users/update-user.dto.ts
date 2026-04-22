import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'nuevoemail@example.com',
    description: 'Email único del usuario (debe ser válido)',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: 'Carlos González',
    description: 'Nombre completo del usuario (mínimo 2 caracteres)',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  nombre?: string;

  @ApiPropertyOptional({
    example: 'NewPassword456',
    description: 'Nueva contraseña del usuario (mínimo 6 caracteres)',
    format: 'password',
  })
  @Transform(({ value, obj }) => value ?? obj?.contraseña)
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Estado del usuario (activo/inactivo)',
  })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
