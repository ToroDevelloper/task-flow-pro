import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateStudentDto } from '../../dtos/dto-students/create-student.dto';
import { Student } from './student.entity';
import { StudentResponse, StudentsService } from './students.service';

@ApiTags('Estudiantes')
@Controller('estudiantes')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @ApiOperation({
    summary: 'Crear estudiante',
    description: 'Crea un estudiante con nombre, apellido y codigo.',
  })
  @ApiCreatedResponse({
    description: 'Estudiante creado correctamente',
    type: Student,
  })
  @ApiConflictResponse({
    description: 'Ya existe un estudiante con el codigo enviado',
  })
  @Post()
  @HttpCode(201)
  async crear(@Body() dto: CreateStudentDto): Promise<StudentResponse> {
    return await this.studentsService.crear(dto);
  }

  @ApiOperation({
    summary: 'Listar estudiantes',
    description: 'Retorna todos los estudiantes registrados.',
  })
  @ApiOkResponse({
    description: 'Listado de estudiantes obtenido correctamente',
    type: [Student],
  })
  @Get()
  async obtenerTodos(): Promise<StudentResponse[]> {
    return await this.studentsService.obtenerTodos();
  }
}
