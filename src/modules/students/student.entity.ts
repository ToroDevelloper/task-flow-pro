import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('estudiantes')
export class Student {
  @ApiProperty({
    format: 'uuid',
    description: 'ID unico del estudiante',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Nombre del estudiante',
    example: 'Juan',
  })
  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @ApiProperty({
    description: 'Apellido del estudiante',
    example: 'Perez',
  })
  @Column({ type: 'varchar', length: 100 })
  apellido: string;

  @ApiProperty({
    description: 'Codigo unico del estudiante',
    example: 'EST-001',
  })
  @Column({ type: 'varchar', length: 50, unique: true })
  codigo: string;

  @ApiProperty({
    format: 'date-time',
    description: 'Fecha y hora de creacion del estudiante',
  })
  @CreateDateColumn()
  fechaCreacion: Date;

  @ApiProperty({
    format: 'date-time',
    description: 'Fecha y hora de la ultima actualizacion del estudiante',
  })
  @UpdateDateColumn()
  fechaActualizacion: Date;
}
