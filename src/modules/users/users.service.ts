import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { Role } from '../../common/enums/role.enum';
import { CreateUserDto } from '../../dtos/dto-users/create-user.dto';
import { UpdateUserDto } from '../../dtos/dto-users/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async crear(dto: CreateUserDto): Promise<User> {
    const { email, nombre, password, rol = Role.DESARROLLADOR } = dto;

    // Validar que el email no exista
    const usuarioExistente = await this.usersRepository.findOne({ where: { email } });
    if (usuarioExistente) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    // Validar contraseña
    if (!password || password.length < 6) {
      throw new BadRequestException('La contraseña debe tener al menos 6 caracteres');
    }

    // Encriptar la contraseña
    const contraseñaEncriptada = await bcrypt.hash(password, 10);

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

  async actualizar(id: string, datos: UpdateUserDto): Promise<User> {
    const usuario = await this.buscarPorId(id);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (datos.email && datos.email !== usuario.email) {
      const usuarioExistente = await this.usersRepository.findOne({ where: { email: datos.email } });
      if (usuarioExistente) {
        throw new ConflictException('El correo electrónico ya está registrado');
      }
    }

    const actualizacion: Partial<User> = {
      email: datos.email,
      nombre: datos.nombre,
      rol: datos.rol,
      activo: datos.activo,
    };

    if (datos.password) {
      actualizacion.contraseña = await bcrypt.hash(datos.password, 10);
    }

    Object.assign(usuario, actualizacion);
    return await this.usersRepository.save(usuario);
  }

  async eliminar(id: string): Promise<void> {
    const resultado = await this.usersRepository.delete(id);
    if (resultado.affected === 0) {
      throw new NotFoundException('Usuario no encontrado');
    }
  }
}
