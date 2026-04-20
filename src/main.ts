import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ==================== CONFIGURACIÓN SWAGGER ====================
  const swaggerConfig = new DocumentBuilder()
    .setTitle('🚀 TaskFlow Pro API')
    .setDescription(
      'API completa para gestión de tareas y proyectos con autenticación segura.\n\n' +
        '## Características\n' +
        '- ✅ Autenticación con JWT\n' +
        '- ✅ Control de roles (ADMIN, GERENTE, DESARROLLADOR)\n' +
        '- ✅ Gestión completa de usuarios\n' +
        '- ✅ Gestión de proyectos\n' +
        '- ✅ Validación de datos con class-validator\n' +
        '- ✅ Documentación automática interactiva\n\n' +
        '## Guía Rápida\n' +
        '1. **Registrarse**: POST `/auth/registro`\n' +
        '2. **Iniciar sesión**: POST `/auth/login` (obtener token)\n' +
        '3. **Usar token**: Incluir en header `Authorization: Bearer <token>`\n' +
        '4. **Crear usuario**: POST `/users` (solo ADMIN)\n' +
        '5. **Crear proyecto**: POST `/projects` (ADMIN y GERENTE)\n\n' +
        '## Roles y Permisos\n' +
        '- **ADMIN**: Crear, actualizar, eliminar usuarios y proyectos\n' +
        '- **GERENTE**: Listar usuarios, crear y actualizar proyectos\n' +
        '- **DESARROLLADOR**: Ver perfil propio, listar proyectos',
    )
    .setVersion('1.0.0')
    .setContact(
      'Task Flow Pro',
      'https://example.com',
      'support@taskflowpro.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:3000', 'Desarrollo')
    .addServer('https://api.taskflowpro.com', 'Producción')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Ingresa el JWT token en el formato: **Bearer <token>**',
      },
      'Bearer',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
      showRequestHeaders: true,
      operationsSorter: 'method',
      tagsSorter: 'alpha',
    },
    customCss: `
      .topbar { display: none; }
      .swagger-ui .info { margin: 20px 0; }
      .swagger-ui .model-box { padding: 15px; }
    `,
    customCssUrl: [
      'https://cdn.jsdelivr.net/npm/swagger-ui-themes@3/themes/3.52.0/theme-material.css',
    ],
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`\n✅ Servidor ejecutándose en: http://localhost:${port}`);
  console.log(
    `📚 Documentación Swagger disponible en: http://localhost:${port}/docs\n`,
  );
}
bootstrap();
