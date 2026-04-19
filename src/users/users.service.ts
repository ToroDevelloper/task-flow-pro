import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async crear(email: string, nombre: string, contraseña: string, rol: Role = Role.DESARROLLADOR): Promise<User> {
    // Validar que el email no exista
    const usuarioExistente = await this.usersRepository.findOne({ where: { email } });
    if (usuarioExistente) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    // Validar contraseña
    if (!contraseña || contraseña.length < 6) {
      throw new BadRequestException('La contraseña debe tener al menos 6 caracteres');
    }

    // Encriptar la contraseña
    const contraseñaEncriptada = await bcrypt.hash(contraseña, 10);

    // Crear y guardar el nuevo usuario
    const nuevoUsuario = this.usersRepository.create({
      email,
      nombre,
      contraseña: contraseñaEncriptada,
      rol,
      activo: true,
    });

    return await this.usersRepository.save(nuevoUsuario);
  }

  async buscarPorEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { email } });
  }

  async buscarPorId(id: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { id } });
  }

  async verificarContraseña(contraseña: string, contraseñaEncriptada: string): Promise<boolean> {
    return await bcrypt.compare(contraseña, contraseñaEncriptada);
  }

  async obtenerTodos(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async actualizar(id: string, datos: Partial<User>): Promise<User> {
    const usuario = await this.buscarPorId(id);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (datos.contraseña) {
      datos.contraseña = await bcrypt.hash(datos.contraseña, 10);
    }

    Object.assign(usuario, datos);
    return await this.usersRepository.save(usuario);
  }

  async eliminar(id: string): Promise<void> {
    const resultado = await this.usersRepository.delete(id);
    if (resultado.affected === 0) {
      throw new NotFoundException('Usuario no encontrado');
    }
  }
}
