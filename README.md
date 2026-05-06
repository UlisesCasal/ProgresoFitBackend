# ProgresoFit Backend API

API REST para la gestión de gimnasios y usuarios. Desarrollada en Node.js + Express con MySQL y Docker.

---

## Cómo levantar el proyecto

### Pre-requisitos
- **Docker Desktop** instalado y corriendo.
- (Opcional) **Node.js** si querés correr sin Docker.

### Pasos

1. **Clonar el repositorio**
   ```bash
   git clone <tu-repo>
   cd ProgresoFitBackend
   ```

2. **Levantar los contenedores**
   ```bash
   docker compose up -d --build
   ```
   La primera vez tarda unos minutos (descarga imágenes de Node y MySQL).

3. **Verificar que esté funcionando**
   ```bash
   curl http://localhost:3000/
   # {"message":"API ProgresoFit funcionando"}
   ```
   Si no responde: `docker compose logs backend`

4. **Restaurar la base de datos**
   ```bash
   docker compose up -d mysql          # Levantá solo MySQL primero
   docker compose ps                   # Esperá a que esté "healthy"
   docker compose up -d backend        # Levantá el backend
   # Importar datos de ejemplo:
   docker exec -i progresofit-mysql mysql -u root -proot_password progresofit < backup_progresofit.sql
   ```

5. **(Alternativa) Crear las tablas manualmente**

   Conectate con cualquier cliente MySQL (`localhost:3306`, usuario `progresofit_user`, password `progresofit_pass`, base `progresofit`) y ejecutá:

   ```sql
   CREATE TABLE IF NOT EXISTS usuarios (
     id         INT AUTO_INCREMENT PRIMARY KEY,
     nombre     VARCHAR(255)                            NULL,
     email      VARCHAR(255)                      NOT NULL UNIQUE,
     password   VARCHAR(255)                      NOT NULL,
     rol        ENUM('ADMIN','ENTRENADOR','ALUMNO') NOT NULL DEFAULT 'ALUMNO',
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE TABLE IF NOT EXISTS gimnasios (
     id         INT AUTO_INCREMENT PRIMARY KEY,
     nombre     VARCHAR(255)  NOT NULL,
     direccion  TEXT,
     horarios   TEXT,
     activo     BOOLEAN DEFAULT TRUE,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

   > **Si ya tenés la BD corriendo** y necesitás agregar la columna `nombre`:
   > ```sql
   > ALTER TABLE usuarios ADD COLUMN nombre VARCHAR(255) DEFAULT NULL AFTER id;
   > ```

---

## Autenticación (JWT)

La API usa **JSON Web Tokens**. El flujo es:

1. Hacés login → el backend devuelve un `token`.
2. Guardás el token en el cliente.
3. En cada request protegido lo enviás en el header:
   ```
   Authorization: Bearer <TOKEN>
   ```

---

## Endpoints

### Auth `/auth`

#### `POST /auth/register`
Registra un usuario. Útil para crear el primer ADMIN en desarrollo.

- **Protegido**: NO
- **Body**:
  ```json
  {
    "email": "admin@test.com",
    "password": "admin123",
    "rol": "ADMIN"
  }
  ```
  > `rol` es opcional, por defecto `ALUMNO`. Valores posibles: `ADMIN`, `ENTRENADOR`, `ALUMNO`.
- **Respuesta 201**:
  ```json
  {
    "message": "Usuario registrado exitosamente",
    "user": { "id": 1, "email": "admin@test.com", "rol": "ADMIN" }
  }
  ```
- **Errores**: `400` email ya registrado · `400` email o password faltante

---

#### `POST /auth/login`
Devuelve un token JWT.

- **Protegido**: NO
- **Body**:
  ```json
  { "email": "admin@test.com", "password": "admin123" }
  ```
- **Respuesta 200**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { "id": 1, "email": "admin@test.com", "rol": "ADMIN" }
  }
  ```
- **Errores**: `401` credenciales inválidas · `400` email o password faltante

---

#### `POST /auth/logout`
Endpoint de consistencia. El cliente es responsable de descartar el token.

- **Protegido**: SÍ
- **Respuesta 200**:
  ```json
  { "message": "Logout exitoso. Eliminá el token del cliente" }
  ```
- **Errores**: `401` token no proporcionado · `403` token inválido o expirado

---

### Usuarios `/usuarios`

#### `POST /usuarios/alumno`
Registra un nuevo alumno. Endpoint público para el formulario de registro.

- **Protegido**: NO
- **Body**:
  ```json
  {
    "nombre": "Juan Pérez",
    "email": "juan@test.com",
    "password": "123456"
  }
  ```
  > `nombre` es opcional.
- **Respuesta 201**:
  ```json
  {
    "message": "Alumno registrado exitosamente",
    "user": { "id": 3, "nombre": "Juan Pérez", "email": "juan@test.com", "rol": "ALUMNO" }
  }
  ```
- **Errores**: `400` email ya registrado · `400` email o password faltante

---

#### `POST /usuarios/entrenador`
Crea un nuevo entrenador. Solo puede ejecutarlo un ADMIN.

- **Protegido**: SÍ + **Rol ADMIN**
- **Body**:
  ```json
  {
    "nombre": "Carlos López",
    "email": "carlos@test.com",
    "password": "abc123"
  }
  ```
  > `nombre` es opcional.
- **Respuesta 201**:
  ```json
  {
    "message": "Entrenador creado exitosamente",
    "user": { "id": 4, "nombre": "Carlos López", "email": "carlos@test.com", "rol": "ENTRENADOR" }
  }
  ```
- **Errores**: `401` sin token · `403` token inválido · `400` email ya registrado · `400` rol insuficiente

---

#### `GET /usuarios/:id`
Devuelve el perfil básico de un usuario.

- **Protegido**: SÍ (cualquier rol)
- **Respuesta 200**:
  ```json
  {
    "id": 3,
    "nombre": "Juan Pérez",
    "email": "juan@test.com",
    "rol": "ALUMNO",
    "created_at": "2026-05-06T17:56:51.000Z"
  }
  ```
- **Errores**: `404` usuario no encontrado · `401` sin token

---

### Gimnasios `/gimnasios`

#### `GET /gimnasios`
Lista todos los gimnasios activos. Soporta búsqueda por nombre.

- **Protegido**: SÍ (cualquier rol)
- **Query params**: `?search=Central` (opcional)
- **Respuesta 200**:
  ```json
  [
    { "id": 1, "nombre": "Gimnasio Central", "direccion": "Av. Ejemplo 123", "horarios": "24hs", "activo": 1 }
  ]
  ```

---

#### `GET /gimnasios/:id`
Devuelve un gimnasio por ID (solo activos).

- **Protegido**: SÍ (cualquier rol)
- **Respuesta 200**:
  ```json
  { "id": 1, "nombre": "Gimnasio Central", "direccion": "Av. Ejemplo 123", "horarios": "24hs", "activo": 1 }
  ```
- **Errores**: `404` no encontrado o dado de baja

---

#### `POST /gimnasios`
Crea un nuevo gimnasio.

- **Protegido**: SÍ + **Rol ADMIN**
- **Body**:
  ```json
  {
    "nombre": "Gimnasio Norte",
    "direccion": "Ruta 9 km 5",
    "horarios": "Lun-Sab 07:00-21:00"
  }
  ```
  > `direccion` y `horarios` son opcionales.
- **Respuesta 201**:
  ```json
  { "id": 2, "nombre": "Gimnasio Norte", "direccion": "Ruta 9 km 5", "horarios": "Lun-Sab 07:00-21:00", "activo": true }
  ```
- **Errores**: `400` nombre faltante · `403` sin permiso

---

#### `PUT /gimnasios/:id`
Actualiza los datos de un gimnasio.

- **Protegido**: SÍ + **Rol ADMIN**
- **Body** (todos los campos son enviados, los vacíos se guardan como vacíos):
  ```json
  {
    "nombre": "Gimnasio Norte Editado",
    "direccion": "Nueva Dirección 456",
    "horarios": "24hs"
  }
  ```
- **Respuesta 200**:
  ```json
  { "id": 2, "nombre": "Gimnasio Norte Editado", "direccion": "Nueva Dirección 456", "horarios": "24hs" }
  ```
- **Errores**: `403` sin permiso

---

#### `DELETE /gimnasios/:id`
Baja lógica: marca el gimnasio como `activo = FALSE`. No elimina el registro.

- **Protegido**: SÍ + **Rol ADMIN**
- **Respuesta 200**:
  ```json
  { "message": "Gimnasio dado de baja lógicamente" }
  ```
- **Errores**: `403` sin permiso

---

## Códigos de respuesta

| Código | Cuándo ocurre |
|--------|---------------|
| `200` | OK |
| `201` | Recurso creado exitosamente |
| `400` | Datos inválidos (campo faltante, email duplicado, rol insuficiente) |
| `401` | Token no proporcionado |
| `403` | Token inválido/expirado, o rol sin permiso para esa acción |
| `404` | Recurso no encontrado |
| `500` | Error interno del servidor |

---

## Ejemplos curl

```bash
# 1. Registrar el primer admin (solo en desarrollo)
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123","rol":"ADMIN"}'

# 2. Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}'
# Guardá el valor de "token"

# 3. Registrar un alumno (sin token)
curl -X POST http://localhost:3000/usuarios/alumno \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Juan Pérez","email":"juan@test.com","password":"123456"}'

# 4. Crear un entrenador (ADMIN)
curl -X POST http://localhost:3000/usuarios/entrenador \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"nombre":"Carlos López","email":"carlos@test.com","password":"abc123"}'

# 5. Ver perfil
curl http://localhost:3000/usuarios/3 \
  -H "Authorization: Bearer <TOKEN>"

# 6. Listar gimnasios
curl http://localhost:3000/gimnasios \
  -H "Authorization: Bearer <TOKEN>"

# 7. Buscar gimnasio por nombre
curl "http://localhost:3000/gimnasios?search=Norte" \
  -H "Authorization: Bearer <TOKEN>"

# 8. Crear gimnasio (ADMIN)
curl -X POST http://localhost:3000/gimnasios \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"nombre":"Gimnasio Norte","direccion":"Ruta 9","horarios":"24hs"}'

# 9. Dar de baja un gimnasio (ADMIN)
curl -X DELETE http://localhost:3000/gimnasios/2 \
  -H "Authorization: Bearer <TOKEN>"
```

---

## Estructura del proyecto

```
src/
 └── server.js               # Entry point de Express
routes/
 ├── authRoutes.js           # /auth
 ├── gimnasioRoutes.js       # /gimnasios
 └── usuarioRoutes.js        # /usuarios
controllers/
 ├── authController.js
 ├── gimnasioController.js
 └── usuarioController.js
services/
 ├── authService.js          # Lógica de registro y login
 ├── gimnasioService.js      # Lógica y validaciones de gimnasios
 └── usuarioService.js       # Lógica y validaciones de usuarios
repositories/
 ├── gimnasioRepository.js   # SQL de gimnasios
 └── usuarioRepository.js    # SQL de usuarios
middleware/
 └── authMiddleware.js       # authenticateToken + checkRole
database/
 └── connection.js           # Pool de conexiones MySQL
docker-compose.yml
Dockerfile
backup_progresofit.sql
```

---

## Persistencia de datos

Los datos de MySQL se guardan en un volumen de Docker (`mysql_data`).

- `docker compose stop` → los datos se conservan.
- `docker compose down` → los contenedores se borran pero los datos se conservan.
- `docker compose down -v` → **borra también los datos** (cuidado).
