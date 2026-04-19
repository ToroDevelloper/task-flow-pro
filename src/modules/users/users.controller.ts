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
  ApiCreatedResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiParam,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { Role } from '../../common/enums/role.enum';
import { CreateUserDto } from '../../dtos/dto-users/create-user.dto';
import { UpdateUserDto } from '../../dtos/dto-users/update-user.dto';

@ApiTags('👥 Users')
@ApiBearerAuth('Bearer')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiOperation({
    summary: '✨ Crear nuevo usuario',
    description: 'Crea un nuevo usuario en el sistema. Solo accesible por ADMIN.\n\nSe encripta la contraseña automáticamente.',
  })
  @ApiCreatedResponse({
    description: 'Usuario creado exitosamente',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'nuevo@example.com',
        nombre: 'Nuevo Usuario',
        rol: 'gerente',
        activo: true,
        fechaCreacion: '2025-04-19T10:30:00.000Z',
        fechaActualizacion: '2025-04-19T10:30:00.000Z',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Token no proporcionado o inválido' })
  @ApiForbiddenResponse({ description: 'Solo ADMIN puede crear usuarios' })
  @ApiConflictResponse({ description: 'El email ya está registrado' })
  @Roles(Role.ADMIN)
  @Post()
  @HttpCode(201)
  async crear(@Body() dto: CreateUserDto): Promise<Partial<User>> {
    const usuario = await this.usersService.crear(dto);
    // No devolver la contraseña
    const { contraseña: _, ...usuarioSinContraseña } = usuario;
    return usuarioSinContraseña;
  }

  @ApiOperation({
    summary: '📋 Listar todos los usuarios',
    description: 'Retorna una lista de todos los usuarios del sistema. Solo ADMIN y GERENTE pueden ver este listado.',
  })
  @ApiOkResponse({
    description: 'Listado de usuarios obtenido correctamente',
    schema: {
      example: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          email: 'admin@example.com',
          nombre: 'Admin User',
          rol: 'admin',
          activo: true,
          fechaCreacion: '2025-04-19T10:30:00.000Z',
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          email: 'gerente@example.com',
          nombre: 'Gerente User',
          rol: 'gerente',
          activo: true,
          fechaCreacion: '2025-04-19T10:35:00.000Z',
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Token no proporcionado o inválido' })
  @ApiForbiddenResponse({ description: 'Solo ADMIN y GERENTE pueden listar usuarios' })
  @Roles(Role.ADMIN, Role.GERENTE)
  @Get()
  async obtenerTodos(): Promise<Partial<User>[]> {
    const usuarios = await this.usersService.obtenerTodos();
    return usuarios.map(({ contraseña: _, ...usuario }) => usuario);
  }

  @ApiOperation({
    summary: '🔍 Obtener usuario por ID',
    description: 'Obtiene la información detallada de un usuario específico. Solo ADMIN y GERENTE tienen acceso.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'ID único del usuario (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: 'Usuario encontrado',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'usuario@example.com',
        nombre: 'Juan Pérez',
        rol: 'gerente',
        activo: true,
        fechaCreacion: '2025-04-19T10:30:00.000Z',
        fechaActualizacion: '2025-04-19T10:30:00.000Z',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Token no proporcionado o inválido' })
  @ApiForbiddenResponse({ description: 'Solo ADMIN y GERENTE pueden ver usuarios' })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado' })
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

  @ApiOperation({
    summary: '✏️ Actualizar usuario',
    description: 'Actualiza la información de un usuario existente. Solo ADMIN puede actualizar usuarios.\n\nLos campos son opcionales. Si se proporciona contraseña, se encriptará automáticamente.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'ID único del usuario (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: 'Usuario actualizado exitosamente',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'nuevoemail@example.com',
        nombre: 'Nombre Actualizado',
        rol: 'gerente',
        activo: true,
        fechaCreacion: '2025-04-19T10:30:00.000Z',
        fechaActualizacion: '2025-04-19T11:45:00.000Z',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Token no proporcionado o inválido' })
  @ApiForbiddenResponse({ description: 'Solo ADMIN puede actualizar usuarios' })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado' })
  @ApiConflictResponse({ description: 'El email ya está en uso por otro usuario' })
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

  @ApiOperation({
    summary: '🗑️ Eliminar usuario',
    description: 'Elimina un usuario del sistema permanentemente. Solo ADMIN puede eliminar usuarios.\n\n⚠️ Esta acción no puede ser revertida.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'ID único del usuario (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiNoContentResponse({ description: 'Usuario eliminado exitosamente' })
  @ApiUnauthorizedResponse({ description: 'Token no proporcionado o inválido' })
  @ApiForbiddenResponse({ description: 'Solo ADMIN puede eliminar usuarios' })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado' })
  @Roles(Role.ADMIN)
  @Delete(':id')
  @HttpCode(204)
  async eliminar(@Param('id') id: string): Promise<void> {
    await this.usersService.eliminar(id);
  }
}
