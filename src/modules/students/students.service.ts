import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStudentDto } from '../../dtos/dto-students/create-student.dto';
import { Student } from './student.entity';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentsRepository: Repository<Student>,
  ) {}

  async crear(dto: CreateStudentDto): Promise<Student> {
    const existente = await this.studentsRepository.findOne({
      where: { codigo: dto.codigo },
    });

    if (existente) {
      throw new ConflictException(
        `Ya existe un estudiante con codigo ${dto.codigo}`,
      );
    }

    const student = this.studentsRepository.create(dto);
    return await this.studentsRepository.save(student);
  }

  async obtenerTodos(): Promise<Student[]> {
    return await this.studentsRepository.find({
      order: { fechaCreacion: 'DESC' },
    });
  }
}
