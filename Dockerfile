# 1. Usamos una imagen oficial ligera de Node.js (versión 18)
FROM node:18-alpine
# 2. Establecemos el directorio de trabajo dentro del contenedor
WORKDIR /app
# 3. Copiamos primero los archivos de dependencias
# Esto es clave: Docker cachea esta capa. Si no cambias package.json, no vuelve a correr npm install
COPY package*.json ./
# 4. Instalamos las dependencias dentro del contenedor
RUN npm install
# 5. Copiamos el resto del código de tu proyecto al contenedor
COPY . .
# 6. Exponemos el puerto que usa tu backend (el 3000 que definimos en .env)
EXPOSE 3000
# 7. Comando para iniciar la aplicación
CMD ["node", "src/server.js"]