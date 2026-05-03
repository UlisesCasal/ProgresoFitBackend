# 🏋️ ProgresoFit Backend API

API REST para la gestión de gimnasios, usuarios y autenticación. Desarrollada en Node.js + Express con MySQL y Docker.

## 🚀 Cómo levantar el proyecto

### Pre-requisitos
- Docker Desktop instalado
- Node.js (para desarrollo local opcional)

### Pasos

1.  **Clonar el repositorio**
    ```bash
    git clone <tu-repo>
    cd ProgresoFitBackend
    ```

2.  **Levantar los contenedores (MySQL + Backend)**
    Este comando construye la imagen del backend y levanta la base de datos.
    ```bash
    docker compose up -d --build
    ```

3.  **Verificar que esté funcionando**
    Abrí en tu navegador: `http://localhost:3000/`
    Deberías ver: `{"message":"API ProgresoFit funcionando 💪"}`

4.  **Crear las tablas en la Base de Datos**
    Usá **SQLTools** en VS Code o tu cliente MySQL preferido con estos datos:
    - **Host**: `localhost`
    - **Port**: `3306`
    - **User**: `progresofit_user`
    - **Password**: `progresofit_pass`
    - **Database**: `progresofit`

    Ejecutá estos Scripts:
    ```sql
    -- Tabla Usuarios
    CREATE TABLE IF NOT EXISTS usuarios (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      rol ENUM('ADMIN', 'ENTRENADOR', 'ALUMNO') NOT NULL DEFAULT 'ALUMNO',
      gimnasio_id INT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabla Gimnasios
    CREATE TABLE IF NOT EXISTS gimnasios (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL,
      direccion TEXT,
      horarios TEXT,
      activo BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ```

---

## 🔐 Autenticación (JWT)

La API usa **JSON Web Tokens (JWT)** para proteger las rutas.

### Flujo:
1.  El usuario hace **Login**.
2.  El backend devuelve un `token` (string encriptado).
3.  El frontend debe guardar ese token (en `localStorage` o `cookie`).
4.  Para las rutas protegidas, el frontend debe enviar el token en el header:
    ```
    Authorization: Bearer <TU_TOKEN_AQUI>
    ```

---

## 📡 Endpoints Disponibles

### 1. Autenticación (`/auth`)

#### `POST /auth/register`
Registra un nuevo usuario.
- **Protegido**: NO
- **Body (JSON)**:
    ```json
    {
      "email": "usuario@test.com",
      "password": "123456",
      "rol": "ALUMNO" 
    }
    ```
  > *Nota: El rol es opcional, por defecto es ALUMNO. Para crear gimnasios, necesitás rol ADMIN.*

#### `POST /auth/login`
Devuelve un token JWT y los datos del usuario.
- **Protegido**: NO
- **Body (JSON)**:
    ```json
    {
      "email": "usuario@test.com",
      "password": "123456"
    }
    ```
- **Respuesta exitosa**:
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": 1,
        "email": "usuario@test.com",
        "rol": "ADMIN"
      }
    }
    ```

#### `POST /auth/logout`
Endpoint para consistencia de API (El frontend debe borrar el token).
- **Protegido**: SÍ (Requiere Token)
- **Headers**: `Authorization: Bearer <TOKEN>`

---

### 2. Gimnasios (`/gimnasios`)

#### `GET /gimnasios`
Lista todos los gimnasios activos. Soporta búsqueda por nombre.
- **Protegido**: SÍ (Cualquier usuario logueado)
- **Query Params (Opcional)**: `?search=Central`
- **Headers**: `Authorization: Bearer <TOKEN>`

#### `GET /gimnasios/:id`
Obtiene un gimnasio por su ID.
- **Protegido**: SÍ
- **Headers**: `Authorization: Bearer <TOKEN>`

#### `POST /gimnasios`
Crea un nuevo gimnasio.
- **Protegido**: SÍ + **Rol ADMIN requerido**
- **Headers**: `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`
- **Body (JSON)**:
    ```json
    {
      "nombre": "Gimnasio Central",
      "direccion": "Av. Siempre Viva 123",
      "horarios": "Lun-Vie 08:00-22:00"
    }
    ```

#### `PUT /gimnasios/:id`
Actualiza un gimnasio existente.
- **Protegido**: SÍ + **Rol ADMIN requerido**
- **Headers**: `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`
- **Body (JSON)**:
    ```json
    {
      "nombre": "Gimnasio Central Editado",
      "direccion": "Nueva Dirección 456"
    }
    ```

#### `DELETE /gimnasios/:id`
Baja lógica (no borra el registro, solo lo marca como `activo = FALSE`).
- **Protegido**: SÍ + **Rol ADMIN requerido**
- **Headers**: `Authorization: Bearer <TOKEN>`

---

## 🧪 Ejemplos de Consumo con `curl`

### 1. Login y obtención de Token
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}'
```
*(Guardate el valor de "token" de la respuesta)*

### 2. Crear un Gimnasio (usando el Token)
```bash
curl -X POST http://localhost:3000/gimnasios \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer AQUI_VA_EL_TOKEN_LARGO" \
  -d '{"nombre":"Gimnasio Norte","direccion":"Ruta 9","horarios":"24hs"}'
```

### 3. Listar Gimnasios
```bash
curl -X GET http://localhost:3000/gimnasios \
  -H "Authorization: Bearer AQUI_VA_EL_TOKEN_LARGO"
```

---

## 🚨 Códigos de Error Comunes

| Código | Significado | Causa probable |
|--------|--------------|----------------|
| **401 Unauthorized** | No autenticado | Falta el header `Authorization` o el token expiró. |
| **403 Forbidden** | No autorizado | Sos ALUMNO y querés hacer algo de ADMIN. |
| **400 Bad Request** | Datos inválidos | Falta el email/password o el email ya existe. |
| **404 Not Found** | No encontrado | El ID de gimnasio no existe o está dado de baja. |

---

## 🛑 Cómo detener todo

```bash
docker compose down
```

Si querés borrar también la base de datos (cuidado, se pierden los datos):
```bash
docker compose down -v
```

---

## 🏗️ Estructura del Proyecto (Arquitectura de 4 capas)

```
src/
 └── server.js             # Entrada de la app (Express)
routes/                   # Define las URLs y middlewares de autenticación
controllers/              # Maneja requests/respuestas HTTP
services/                 # Lógica de negocio (valida permisos/roles)
repositories/             # Acceso a datos (SQL puro)
models/                   # Referencias de tablas
database/
 └── connection.js        # Pool de conexiones a MySQL
docker-compose.yml        # Orquestación de Backend + MySQL
Dockerfile                # Imagen de Node.js
```

---

## 💾 Sobre la persistencia de datos (Volúmenes)

Si apagás los contenedores (`docker compose stop`), **NO se pierde el esquema ni los datos** porque usamos un volumen de Docker:
- `mysql_data:/var/lib/mysql`

Solo se pierden los datos si hacés `docker compose down -v` (el flag `-v` borra los volúmenes).
