import { Controller, Get, Post, Body, Param, Delete, UseGuards, HttpCode } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { Role } from '../common/enums/role.enum';

@Controller('usuarios')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('crear')
  @HttpCode(201)
  async crear(
    @Body('email') email: string,
    @Body('nombre') nombre: string,
    @Body('contraseña') contraseña: string,
    @Body('rol') rol?: Role,
  ): Promise<Partial<User>> {
    const usuario = await this.usersService.crear(email, nombre, contraseña, rol);
    // No devolver la contraseña
    const { contraseña: _, ...usuarioSinContraseña } = usuario;
    return usuarioSinContraseña;
  }

  @Get()
  async obtenerTodos(): Promise<Partial<User>[]> {
    const usuarios = await this.usersService.obtenerTodos();
    return usuarios.map(({ contraseña: _, ...usuario }) => usuario);
  }

  @Get(':id')
  async obtenerPorId(@Param('id') id: string): Promise<Partial<User>> {
    const usuario = await this.usersService.buscarPorId(id);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }
    const { contraseña: _, ...usuarioSinContraseña } = usuario;
    return usuarioSinContraseña;
  }

  @Delete(':id')
  @HttpCode(204)
  async eliminar(@Param('id') id: string): Promise<void> {
    await this.usersService.eliminar(id);
  }
}
