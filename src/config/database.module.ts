import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { readFileSync } from 'fs';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbPort = Number(configService.get<string>('DB_PORT') ?? 3306);
        const dbUsername =
          configService.get<string>('DB_USERNAME') ??
          configService.getOrThrow<string>('DB_USER');
        const dbDatabase =
          configService.get<string>('DB_DATABASE') ??
          configService.getOrThrow<string>('DB_NAME');
        const nodeEnv = configService.get<string>('NODE_ENV') ?? 'development';
        const sslEnabled =
          configService.get<string>('DB_SSL')?.toLowerCase() === 'true';
        const rejectUnauthorized =
          configService
            .get<string>('DB_SSL_REJECT_UNAUTHORIZED')
            ?.toLowerCase() !== 'false';
        const sslCaPath = configService.get<string>('DB_SSL_CA_PATH');

        return {
          type: 'mysql',
          host: configService.get<string>('DB_HOST') ?? 'localhost',
          port: Number.isNaN(dbPort) ? 3306 : dbPort,
          username: dbUsername,
          password: configService.getOrThrow<string>('DB_PASSWORD'),
          database: dbDatabase,
          autoLoadEntities: true,
          // En desarrollo, sincronizar automáticamente. En producción, usar migraciones
          synchronize: nodeEnv === 'development',
          logging: nodeEnv === 'development',
          ssl: sslEnabled
            ? {
                rejectUnauthorized,
                ca: sslCaPath ? readFileSync(sslCaPath, 'utf8') : undefined,
              }
            : undefined,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
