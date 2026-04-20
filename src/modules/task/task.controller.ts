import {
  Controller,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { TasksService } from './task.service';
import { Task } from './task.entity';
import { CreateTaskDto } from '../../dtos/dto-task/create-task.dto';
import { AssignTaskDto } from '../../dtos/dto-task/assign-task.dto';

@ApiTags('✅ Tasks')
@ApiBearerAuth('Bearer')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @ApiOperation({
    summary: '✨ Crear nueva tarea',
    description: 'Crea una nueva tarea asociada a un proyecto. Solo GERENTE puede crear tareas.',
  })
  @ApiCreatedResponse({ description: 'Tarea creada exitosamente', type: Task })
  @ApiUnauthorizedResponse({ description: 'Token no proporcionado o inválido' })
  @ApiForbiddenResponse({ description: 'Solo GERENTE puede crear tareas' })
  @ApiBadRequestResponse({ description: 'Datos de entrada inválidos' })
  @ApiNotFoundResponse({ description: 'Proyecto no encontrado' })
  @Roles(Role.GERENTE)
  @Post()
  @HttpCode(201)
  async crear(@Body() dto: CreateTaskDto): Promise<Task> {
    return await this.tasksService.crear(dto);
  }

  @ApiOperation({
    summary: '👤 Asignar tarea a desarrollador',
    description: 'Asigna una tarea existente a un usuario con rol DESARROLLADOR. Solo GERENTE puede asignar tareas.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'ID único de la tarea',
  })
  @ApiOkResponse({ description: 'Tarea asignada exitosamente', type: Task })
  @ApiUnauthorizedResponse({ description: 'Token no proporcionado o inválido' })
  @ApiForbiddenResponse({ description: 'Solo GERENTE puede asignar tareas' })
  @ApiNotFoundResponse({ description: 'Tarea o usuario no encontrado' })
  @ApiBadRequestResponse({ description: 'El usuario no tiene rol DESARROLLADOR' })
  @Roles(Role.GERENTE)
  @Patch(':id/asignar')
  async asignar(
    @Param('id') id: string,
    @Body() dto: AssignTaskDto,
  ): Promise<Task> {
    return await this.tasksService.asignar(id, dto);
  }
}