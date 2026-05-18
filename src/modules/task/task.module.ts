import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { TasksService } from './task.service';
import { TasksController } from './task.controller';
import { ProjectsModule } from '../projects/projects.module';
import { UsersModule } from '../users/users.module';
import { AssignedUserDeveloperGuard } from './guards/assigned-user-developer.guard';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task]),
    ProjectsModule,
    UsersModule,
    MailModule,
  ],
  providers: [TasksService, AssignedUserDeveloperGuard],
  controllers: [TasksController],
  exports: [TasksService],
})
export class TasksModule {}
