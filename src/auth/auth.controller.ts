import { Controller, Post, Body, UseGuards, Get, Request, HttpCode } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt.guard';
import { User } from '../users/user.entity';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Registrar usuario' })
  @ApiResponse({ status: 201, description: 'Usuario registrado' })
  @ApiResponse({ status: 409, description: 'Correo ya registrado' })
  @Post('registro')
  @HttpCode(201)
  async registro(
    @Body('email') email: string,
    @Body('nombre') nombre: string,
    @Body('contraseña') contraseña: string,
  ): Promise<Partial<User>> {
    return await this.authService.registro(email, nombre, contraseña);
  }

  @ApiOperation({ summary: 'Iniciar sesion' })
  @ApiResponse({ status: 200, description: 'Login exitoso con JWT' })
  @ApiResponse({ status: 401, description: 'Credenciales invalidas' })
  @Post('login')
  @HttpCode(200)
  async login(
    @Body('email') email: string,
    @Body('contraseña') contraseña: string,
  ) {
    return await this.authService.login(email, contraseña);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener perfil autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil del usuario autenticado' })
  @ApiResponse({ status: 401, description: 'Token invalido o ausente' })
  @Get('perfil')
  @UseGuards(JwtAuthGuard)
  async obtenerPerfil(@Request() req: any): Promise<Partial<User>> {
    const { contraseña: _, ...usuarioSinContraseña } = req.user;
    return usuarioSinContraseña;
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Validar token JWT' })
  @ApiResponse({ status: 200, description: 'Token valido' })
  @ApiResponse({ status: 401, description: 'Token invalido o ausente' })
  @Get('validar-token')
  @UseGuards(JwtAuthGuard)
  async validarToken(): Promise<{ mensaje: string }> {
    return { mensaje: 'Token válido' };
  }
}
