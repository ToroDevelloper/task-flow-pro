# TaskFlow Pro

API REST para gestion interna de proyectos y tareas con autenticacion JWT y control de acceso basado en roles.

## Integrantes

- Toro Caicedo Angel Ivan
- Jansasoy Munoz Jeferson Andres
- Diaz Imbajoa Tatiana
- Apraez Ceballos Michael Leonardo
- Carrillo Vidales Maria Isabel
- Montana Hurtado Harrisson Estiven
- Castellanos Semanate Farid Esteban

## Tecnologias

- NestJS
- TypeORM
- MySQL
- Passport JWT y `@nestjs/jwt`
- bcrypt
- class-validator y DTOs
- Swagger

## Modelo de dominio

Entidades principales:

- `User`: usuarios del sistema. Tiene email unico, nombre, contrasena encriptada, estado activo y un rol.
- `Role`: roles permitidos en el sistema: `ADMIN`, `GERENTE`, `DESARROLLADOR`.
- `Project`: proyectos con nombre, descripcion, fecha de inicio, fecha de fin y usuario creador.
- `Task`: tareas asociadas a un proyecto, con usuario asignado y estado.

Relaciones:

- Un `Role` tiene muchos `User`.
- Un `User` puede crear muchos `Project`.
- Un `Project` pertenece a un usuario creador. Si el usuario se elimina, el proyecto queda con creador nulo.
- Un `Project` tiene muchas `Task`. Si el proyecto se elimina, sus tareas se eliminan en cascada.
- Una `Task` puede tener un usuario asignado. Si el usuario se elimina, la tarea queda sin asignado.

El MER grafico esta en [Documentacion/MER-tast-flow-pro.jpeg](./Documentacion/MER-tast-flow-pro.jpeg).

## Reglas de negocio

- Ningun endpoint protegido se puede consumir sin token JWT.
- `ADMIN` puede administrar usuarios y eliminar proyectos/tareas.
- `GERENTE` puede listar usuarios, crear proyectos, crear tareas y asignarlas a desarrolladores.
- `DESARROLLADOR` puede consultar recursos autenticados y actualizar el estado de sus tareas asignadas.
- Solo el creador de un proyecto o un `ADMIN` puede actualizarlo.
- Solo `ADMIN` puede eliminar proyectos.
- Solo el usuario asignado puede cambiar el estado de una tarea.
- Solo se pueden asignar tareas a usuarios con rol `DESARROLLADOR`.

## Variables de entorno

Crear un archivo `.env` a partir de `.env.example`:

```bash
cp .env.example .env
```

Variables usadas:

| Variable | Descripcion |
| --- | --- |
| `NODE_ENV` | Entorno de ejecucion. En `development` TypeORM sincroniza entidades. |
| `PORT` | Puerto HTTP de la API. |
| `DB_HOST` | Host de MySQL. |
| `DB_PORT` | Puerto de MySQL. |
| `DB_USER` / `DB_USERNAME` | Usuario de MySQL. |
| `DB_PASSWORD` | Contrasena de MySQL. |
| `DB_NAME` / `DB_DATABASE` | Base de datos usada por TypeORM. |
| `JWT_SECRET` | Secreto para firmar tokens JWT. |

## Instalacion y ejecucion

```bash
npm install
npm run start:dev
```

La API queda disponible en:

```text
http://localhost:3000
```

Swagger queda disponible en:

```text
http://localhost:3000/docs
```

Al iniciar la aplicacion se crean automaticamente los roles base `ADMIN`, `GERENTE` y `DESARROLLADOR` si no existen.

## Seed (roles + usuarios base)

Ejecuta:

```bash
npm run seed
```

Crea/actualiza estos usuarios (idempotente por email):

- `admin@taskflowpro.com` (ADMIN)
- `gerente@taskflowpro.com` (GERENTE)
- `dev@taskflowpro.com` (DESARROLLADOR)

Variables opcionales:

- `SEED_RESET_PASSWORDS=true` (resetea passwords)
- `SEED_SHOW_PASSWORDS=true` (imprime passwords)
- `SEED_*_EMAIL/NAME/PASSWORD` para personalizar
- En `production` está bloqueado salvo `SEED_ALLOW_PROD=true`

## Flujo de prueba en Swagger

1. Registrar usuario: `POST /auth/registro`.
2. Iniciar sesion: `POST /auth/login`.
3. Copiar `accessToken`.
4. Presionar `Authorize` en Swagger y pegar el token.
5. Probar endpoints segun el rol del usuario.

Ejemplo de registro:

```json
{
  "email": "usuario@example.com",
  "nombre": "Usuario Prueba",
  "password": "Password123"
}
```

Ejemplo de login:

```json
{
  "email": "usuario@example.com",
  "password": "Password123"
}
```

## Endpoints principales

### Auth

| Metodo | Ruta | Acceso |
| --- | --- | --- |
| `POST` | `/auth/registro` | Publico |
| `POST` | `/auth/login` | Publico |
| `GET` | `/auth/perfil` | Autenticado |
| `GET` | `/auth/validar-token` | Autenticado |

### Usuarios

| Metodo | Ruta | Acceso |
| --- | --- | --- |
| `POST` | `/users` | `ADMIN` |
| `GET` | `/users` | `ADMIN`, `GERENTE` |
| `GET` | `/users/perfil` | Autenticado |
| `GET` | `/users/:id` | `ADMIN`, `GERENTE` |
| `PATCH` | `/users/:id/rol` | `ADMIN` |
| `PATCH` | `/users/:id` | `ADMIN` |
| `DELETE` | `/users/:id` | `ADMIN` |

### Proyectos

| Metodo | Ruta | Acceso |
| --- | --- | --- |
| `POST` | `/projects` | `ADMIN`, `GERENTE` |
| `GET` | `/projects` | Autenticado |
| `GET` | `/projects/:id` | Autenticado |
| `PATCH` | `/projects/:id` | Creador o `ADMIN` |
| `DELETE` | `/projects/:id` | `ADMIN` |

### Tareas

| Metodo | Ruta | Acceso |
| --- | --- | --- |
| `POST` | `/tasks` | `GERENTE` |
| `PATCH` | `/tasks/:id/asignar` | `GERENTE` |
| `GET` | `/tasks/proyecto/:idProyecto` | Autenticado |
| `PATCH` | `/tasks/:id/estado` | Usuario asignado |
| `DELETE` | `/tasks/:id` | `ADMIN` |

## Verificacion local

```bash
npm run build
npm run test
```

## Cumplimiento de requisitos

| Requisito | Estado |
| --- | --- |
| NestJS API REST por modulos | Cumplido |
| JWT con `@nestjs/jwt` y `@nestjs/passport` | Cumplido |
| bcrypt para contrasenas | Cumplido |
| MySQL con TypeORM | Cumplido |
| DTOs y validaciones con `class-validator` | Cumplido |
| Guards y decorador `@Roles()` | Cumplido |
| Roles `ADMIN`, `GERENTE`, `DESARROLLADOR` | Cumplido |
| Swagger en `/docs` | Cumplido |
| `.env.example` | Cumplido |
| MER documentado | Cumplido en carpeta `Documentacion` |
