import { Transform } from 'class-transformer';
import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../common/enums/role.enum';

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
    example: 'admin',
    enum: Role,
    description: 'Rol del usuario. Por defecto: desarrollador',
    default: Role.DESARROLLADOR,
  })
  @IsOptional()
  @IsEnum(Role)
  rol?: Role;

  @ApiPropertyOptional({
    example: true,
    description: 'Estado del usuario. Por defecto: activo',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
