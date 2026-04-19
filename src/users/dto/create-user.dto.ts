import { Transform } from 'class-transformer';
import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from '../../common/enums/role.enum';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  nombre: string;

  @Transform(({ value, obj }) => value ?? obj?.contraseña)
  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsEnum(Role)
  rol?: Role;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
