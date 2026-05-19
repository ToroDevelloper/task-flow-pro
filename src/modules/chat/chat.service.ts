import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dtos/create-message.dto';

/**
 * Servicio de Chat
 *
 * Maneja la lógica de negocio relacionada con mensajes del chat grupal:
 * - Crear mensajes
 * - Recuperar mensajes por proyecto
 * - Validar acceso a proyectos
 * - Gestión de datos de chat
 *
 * @injectable
 */
@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  /**
   * Crea un nuevo mensaje en la base de datos
   *
   * @param createMessageDto - DTO con los datos del mensaje (content, projectId)
   * @param senderId - ID del usuario que envía el mensaje
   * @returns Promise<Message> - El mensaje guardado con todas sus propiedades
   *
   * @throws BadRequestException - Si el contenido está vacío o no es válido
   *
   * @example
   * const message = await chatService.createMessage(
   *   { content: 'Hello', projectId: 'uuid-123' },
   *   'user-uuid-456'
   * );
   */
  async createMessage(
    createMessageDto: CreateMessageDto,
    senderId: string,
  ): Promise<Message> {
    try {
      const { content, projectId } = createMessageDto;

      // Validación adicional de contenido
      if (!content.trim()) {
        throw new BadRequestException('El mensaje no puede contener solo espacios en blanco');
      }

      // Crear la instancia del mensaje
      const message = this.messageRepository.create({
        content: content.trim(),
        projectId,
        senderId,
      });

      // Guardar en la base de datos
      const savedMessage = await this.messageRepository.save(message);

      this.logger.debug(
        `Mensaje creado - ID: ${savedMessage.id}, Proyecto: ${projectId}, Usuario: ${senderId}`,
      );

      // Cargar las relaciones para la respuesta
      return await this.messageRepository.findOne({
        where: { id: savedMessage.id },
        relations: ['sender', 'project'],
      });
    } catch (error) {
      this.logger.error(
        `Error al crear mensaje: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Recupera los últimos mensajes de un proyecto
   *
   * @param projectId - ID del proyecto
   * @param limit - Número máximo de mensajes a recuperar (default: 50)
   * @returns Promise<Message[]> - Array de mensajes ordenados por fecha descendente
   *
   * @example
   * const messages = await chatService.getProjectMessages('project-uuid', 20);
   */
  async getProjectMessages(projectId: string, limit: number = 50): Promise<Message[]> {
    try {
      const messages = await this.messageRepository.find({
        where: { projectId },
        relations: ['sender'],
        order: { createdAt: 'DESC' },
        take: limit,
      });

      // Invertir para que los más antiguos estén primero
      return messages.reverse();
    } catch (error) {
      this.logger.error(
        `Error al recuperar mensajes del proyecto ${projectId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Valida si un usuario pertenece a un proyecto
   *
   * NOTA: Esta es una función simulada. En producción, debería verificar
   * si el usuario tiene asignado un rol en el proyecto mediante la tabla de relaciones.
   *
   * @param userId - ID del usuario
   * @param projectId - ID del proyecto
   * @returns Promise<boolean> - true si el usuario pertenece al proyecto
   *
   * @example
   * const belongsToProject = await chatService.validateUserProjectAccess(userId, projectId);
   */
  async validateUserProjectAccess(userId: string, projectId: string): Promise<boolean> {
    try {
      // TODO: Implementar verificación real con UserProject o tabla de relaciones
      // Por ahora simulamos que el acceso es válido
      // En producción, consultar:
      // SELECT * FROM user_projects WHERE user_id = $1 AND project_id = $2
      
      this.logger.debug(
        `Validando acceso del usuario ${userId} al proyecto ${projectId}`,
      );

      // Simulación: siempre retorna true
      // En producción, debería verificar la relación en la BD
      return true;
    } catch (error) {
      this.logger.error(
        `Error al validar acceso a proyecto: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }

  /**
   * Cuenta el número total de mensajes en un proyecto
   *
   * @param projectId - ID del proyecto
   * @returns Promise<number> - Cantidad de mensajes
   *
   * @example
   * const count = await chatService.getMessageCount('project-uuid');
   */
  async getMessageCount(projectId: string): Promise<number> {
    try {
      return await this.messageRepository.count({
        where: { projectId },
      });
    } catch (error) {
      this.logger.error(
        `Error al contar mensajes del proyecto ${projectId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Limpia los mensajes antiguos de un proyecto (útil para mantenimiento)
   *
   * @param projectId - ID del proyecto
   * @param daysOld - Eliminar mensajes más antiguos a estos días
   * @returns Promise<number> - Número de mensajes eliminados
   *
   * @example
   * const deleted = await chatService.cleanOldMessages('project-uuid', 30);
   */
  async cleanOldMessages(projectId: string, daysOld: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await this.messageRepository.delete({
        projectId,
        createdAt: cutoffDate,
      });

      this.logger.log(
        `Eliminados ${result.affected} mensajes antiguos del proyecto ${projectId}`,
      );

      return result.affected || 0;
    } catch (error) {
      this.logger.error(
        `Error al limpiar mensajes antiguos: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
