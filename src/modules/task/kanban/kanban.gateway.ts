import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { MoveTaskDto } from '../../../dtos/dto-task/move-task.dto';
import { TasksService } from '../task.service';
import { JwtService } from '@nestjs/jwt';
import { TaskStatus } from '../../../common/enums/task-status.enum';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/kanban',
})
export class KanbanGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private processingQueues = new Map<string, Promise<void>>();

  constructor(
    private readonly tasksService: TasksService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    const payload = this.extractJwt(client);
    if (!payload) {
      client.emit('error', { message: 'Token invalido. Conexion rechazada.' });
      client.disconnect();
      return;
    }
    client.data.user = payload;
  }

  handleDisconnect(client: Socket) {
    console.log(`Cliente desconectado: ${client.id}`);
  }

  @SubscribeMessage('join_project')
  async handleJoinProject(
    @MessageBody() data: { projectId: string },
    @ConnectedSocket() client: Socket,
  ) {
    await client.join(`project:${data.projectId}`);
    client.emit('joined', { room: `project:${data.projectId}` });
  }

  @SubscribeMessage('task_moved')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async handleTaskMoved(
    @MessageBody() dto: MoveTaskDto,
    @ConnectedSocket() client: Socket,
  ) {
    const payload = this.extractJwt(client);
    if (!payload) {
      client.emit('task_move_error', {
        taskId: dto.taskId,
        previousStatus: dto.previousStatus,
        message: 'Sesion expirada. Reconectate.',
      });
      client.disconnect();
      return;
    }

    if (payload.sub !== dto.userId) {
      client.emit('task_move_error', {
        taskId: dto.taskId,
        previousStatus: dto.previousStatus,
        message: 'El userId no coincide con tu sesion.',
      });
      return;
    }

    const queue = this.processingQueues.get(dto.taskId) ?? Promise.resolve();
    const next = queue.then(() =>
      this.procesarMovimiento(dto, client, payload),
    );
    this.processingQueues.set(dto.taskId, next.catch(() => {}));
  }

  private async procesarMovimiento(
    dto: MoveTaskDto,
    client: Socket,
    payload: any,
  ) {
    try {
      await this.tasksService.moverTarea(
        dto.taskId,
        dto.newStatus as TaskStatus,
        payload.sub,
        payload.rol,
      );

      const broadcastPayload = {
        taskId: dto.taskId,
        newStatus: dto.newStatus,
        previousStatus: dto.previousStatus,
        userId: dto.userId,
      };

      this.server
        .to(`project:${dto.projectId}`)
        .emit('task_updated', broadcastPayload);

    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al mover la tarea.';
      client.emit('task_move_error', {
        taskId: dto.taskId,
        previousStatus: dto.previousStatus,
        message: mensaje,
      });
    }
  }

  private extractJwt(client: Socket): any | null {
    try {
      const token =
        client.handshake.auth?.token ??
        client.handshake.headers?.authorization?.replace('Bearer ', '');
      if (!token) return null;
      return this.jwtService.verify(token);
    } catch {
      return null;
    }
  }
}