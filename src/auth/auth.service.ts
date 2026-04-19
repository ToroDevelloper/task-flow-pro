import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { Role } from '../common/enums/role.enum';
import { CreateUserDto } from '../users/dto/create-user.dto';

export interface LoginRequest {
  email: string;
  contraseña: string;
}

export interface LoginResponse {
  accessToken: string;
  usuario: Partial<User>;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async registro(email: string, nombre: string, contraseña: string): Promise<Partial<User>> {
    const createUserDto: CreateUserDto = {
      email,
      nombre,
      password: contraseña,
      rol: Role.DESARROLLADOR,
    };

    const usuario = await this.usersService.crear(createUserDto);
    const { contraseña: _, ...usuarioSinContraseña } = usuario;
    return usuarioSinContraseña;
  }

  async login(email: string, contraseña: string): Promise<LoginResponse> {
    // Validar entrada
    if (!email || !contraseña) {
      throw new BadRequestException('El correo y la contraseña son requeridos');
    }

    // Buscar el usuario
    const usuario = await this.usersService.buscarPorEmail(email);
    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar que el usuario esté activo
    if (!usuario.activo) {
      throw new UnauthorizedException('El usuario está inactivo');
    }

    // Verificar la contraseña
    const contraseñaValida = await this.usersService.verificarContraseña(
      contraseña,
      usuario.contraseña,
    );
    if (!contraseñaValida) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar el token JWT
    const payload = {
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '24h',
    });

    // Devolver el token sin la contraseña
    const { contraseña: _, ...usuarioSinContraseña } = usuario;
    return {
      accessToken,
      usuario: usuarioSinContraseña,
    };
  }

  async validarToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
