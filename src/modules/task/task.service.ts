import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto } from '../../dtos/dto-task/create-task.dto';
import { AssignTaskDto } from '../../dtos/dto-task/assign-task.dto';
import { ProjectsService } from '../projects/projects.service';
import { UsersService } from '../users/users.service';
import { Role } from '../../common/enums/role.enum';
import { TaskStatus } from '../../common/enums/task-status.enum';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    private projectsService: ProjectsService,
    private usersService: UsersService,
  ) {}

  async crear(dto: CreateTaskDto): Promise<Task> {
    const proyecto = await this.projectsService.buscarPorId(dto.idProyecto);
    if (!proyecto) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    const nuevaTarea = this.tasksRepository.create({
      titulo: dto.titulo,
      descripcion: dto.descripcion,
      idProyecto: dto.idProyecto,
      proyecto,
    });

    return await this.tasksRepository.save(nuevaTarea);
  }

  async asignar(id: string, dto: AssignTaskDto): Promise<Task> {
    const tarea = await this.tasksRepository.findOne({
      where: { id },
      relations: ['proyecto', 'usuarioAsignado'],
    });

    if (!tarea) {
      throw new NotFoundException('Tarea no encontrada');
    }

    const usuario = await this.usersService.buscarPorId(dto.idUsuarioAsignado);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Adaptado a la nueva lógica de roles: usuario.rol.nombre
    if (usuario.rol.nombre !== Role.DESARROLLADOR) {
      throw new BadRequestException(
        'Solo se pueden asignar tareas a usuarios con rol DESARROLLADOR',
      );
    }

    tarea.idUsuarioAsignado = dto.idUsuarioAsignado;
    tarea.usuarioAsignado = usuario;

    return await this.tasksRepository.save(tarea);
  }

  async listarPorProyecto(idProyecto: string): Promise<Task[]> {
    const proyecto = await this.projectsService.buscarPorId(idProyecto);
    if (!proyecto) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    return await this.tasksRepository.find({
      where: { idProyecto },
      relations: ['usuarioAsignado'],
    });
  }

  async actualizarEstado(
    id: string,
    estado: TaskStatus,
    idUsuario: string,
  ): Promise<Task> {
    const tarea = await this.tasksRepository.findOne({
      where: { id },
    });

    if (!tarea) {
      throw new NotFoundException('Tarea no encontrada');
    }

    // Lógica estricta: Solo el usuario que tiene la tarea asignada puede realizar este cambio
    if (tarea.idUsuarioAsignado !== idUsuario) {
      throw new ForbiddenException(
        'Solo el usuario asignado a esta tarea puede actualizar su estado',
      );
    }

    tarea.estado = estado;
    return await this.tasksRepository.save(tarea);
  }

  async eliminar(id: string): Promise<void> {
    const tarea = await this.tasksRepository.findOne({
      where: { id },
    });

    if (!tarea) {
      throw new NotFoundException('Tarea no encontrada');
    }

    await this.tasksRepository.remove(tarea);
  }
}
