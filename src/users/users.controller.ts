import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  NotFoundException,
  Patch,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { Role } from '../common/enums/role.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiOperation({ summary: 'Crear usuario' })
  @ApiResponse({ status: 201, description: 'Usuario creado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos' })
  @ApiResponse({ status: 409, description: 'Correo ya registrado' })
  @Roles(Role.ADMIN)
  @Post()
  @HttpCode(201)
  async crear(@Body() dto: CreateUserDto): Promise<Partial<User>> {
    const usuario = await this.usersService.crear(dto);
    // No devolver la contraseña
    const { contraseña: _, ...usuarioSinContraseña } = usuario;
    return usuarioSinContraseña;
  }

  @ApiOperation({ summary: 'Listar usuarios' })
  @ApiResponse({ status: 200, description: 'Listado de usuarios' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos' })
  @Roles(Role.ADMIN, Role.GERENTE)
  @Get()
  async obtenerTodos(): Promise<Partial<User>[]> {
    const usuarios = await this.usersService.obtenerTodos();
    return usuarios.map(({ contraseña: _, ...usuario }) => usuario);
  }

  @ApiOperation({ summary: 'Obtener usuario por ID' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @Roles(Role.ADMIN, Role.GERENTE)
  @Get(':id')
  async obtenerPorId(@Param('id') id: string): Promise<Partial<User>> {
    const usuario = await this.usersService.buscarPorId(id);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    const { contraseña: _, ...usuarioSinContraseña } = usuario;
    return usuarioSinContraseña;
  }

  @ApiOperation({ summary: 'Actualizar usuario' })
  @ApiResponse({ status: 200, description: 'Usuario actualizado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @Roles(Role.ADMIN)
  @Patch(':id')
  async actualizar(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<Partial<User>> {
    const usuario = await this.usersService.actualizar(id, dto);
    const { contraseña: _, ...usuarioSinContraseña } = usuario;
    return usuarioSinContraseña;
  }

  @ApiOperation({ summary: 'Eliminar usuario' })
  @ApiResponse({ status: 204, description: 'Usuario eliminado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @Roles(Role.ADMIN)
  @Delete(':id')
  @HttpCode(204)
  async eliminar(@Param('id') id: string): Promise<void> {
    await this.usersService.eliminar(id);
  }
}
