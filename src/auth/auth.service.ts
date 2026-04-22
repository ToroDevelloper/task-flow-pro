import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../modules/users/users.service';
import { User } from '../modules/users/user.entity';
import { CreateUserDto } from '../dtos/dto-users/create-user.dto';

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

  async registro(
    email: string,
    nombre: string,
    contraseña: string,
  ): Promise<Partial<User>> {
    // El rol por defecto es DESARROLLADOR (lo asigna UsersService si no se indica rolId)
    const createUserDto: CreateUserDto = {
      email,
      nombre,
      password: contraseña,
    };

    const usuario = await this.usersService.crear(createUserDto);
    const { contraseña: _, ...usuarioSinContraseña } = usuario;
    return usuarioSinContraseña;
  }

  async login(email: string, contraseña: string): Promise<LoginResponse> {
    if (!email || !contraseña) {
      throw new BadRequestException('El correo y la contraseña son requeridos');
    }

    const usuario = await this.usersService.buscarPorEmail(email);
    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!usuario.activo) {
      throw new UnauthorizedException('El usuario está inactivo');
    }

    const contraseñaValida = await this.usersService.verificarContraseña(
      contraseña,
      usuario.contraseña,
    );
    if (!contraseñaValida) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Guardar en el payload el nombre del rol (string), no la entidad completa
    const payload = {
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol?.nombre ?? null,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '24h' });

    const { contraseña: _, ...usuarioSinContraseña } = usuario;
    return { accessToken, usuario: usuarioSinContraseña };
  }

  async validarToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
