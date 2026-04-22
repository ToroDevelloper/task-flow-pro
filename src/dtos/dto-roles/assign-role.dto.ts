import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignRoleDto {
  @ApiProperty({
    format: 'uuid',
    description: 'ID único del rol a asignar',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  rolId: string;
}
