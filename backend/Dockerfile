FROM node:18-alpine

WORKDIR /app

# Copiar package.json e instalar dependencias
COPY package*.json ./
RUN npm ci

# Copiar código fuente compilado
COPY . .

# Compilar TypeScript
RUN npm run build

# Eliminar devDependencies
RUN npm prune --production

# Exponer puerto
EXPOSE 3001

# Comando de inicio
CMD ["npm", "start"]