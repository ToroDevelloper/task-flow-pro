import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Global()
@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const dbPort = Number(configService.get<string>('DB_PORT') ?? 3306);
                const dbUsername = configService.get<string>('DB_USERNAME') ?? configService.get<string>('DB_USER');
                const dbDatabase = configService.get<string>('DB_DATABASE') ?? configService.get<string>('DB_NAME');

                return {
                    type: 'mysql',
                    host: configService.get<string>('DB_HOST') ?? 'localhost',
                    port: Number.isNaN(dbPort) ? 3306 : dbPort,
                    username: dbUsername,
                    password: configService.get<string>('DB_PASSWORD'),
                    database: dbDatabase,
                    autoLoadEntities: true,
                    synchronize: false,
                    logging: false,
                };
            }
        })
    ],
})
export class DatabaseModule { }