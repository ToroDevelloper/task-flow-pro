import { Controller, Post, Body, UseGuards, Get, Request, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtGuard } from './guards/jwt.guard';
import { User } from '../users/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('registro')
  @HttpCode(201)
  async registro(
    @Body('email') email: string,
    @Body('nombre') nombre: string,
    @Body('contraseña') contraseña: string,
  ): Promise<Partial<User>> {
    return await this.authService.registro(email, nombre, contraseña);
  }

  @Post('login')
  @HttpCode(200)
  async login(
    @Body('email') email: string,
    @Body('contraseña') contraseña: string,
  ) {
    return await this.authService.login(email, contraseña);
  }

  @Get('perfil')
  @UseGuards(JwtGuard)
  async obtenerPerfil(@Request() req: any): Promise<Partial<User>> {
    const { contraseña: _, ...usuarioSinContraseña } = req.user;
    return usuarioSinContraseña;
  }

  @Get('validar-token')
  @UseGuards(JwtGuard)
  async validarToken(): Promise<{ mensaje: string }> {
    return { mensaje: 'Token válido' };
  }
}
