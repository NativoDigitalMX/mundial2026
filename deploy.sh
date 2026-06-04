#!/bin/bash

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   🚀 Despliegue de Quiniela Mundial   ${NC}"
echo -e "${GREEN}========================================${NC}"

# Verificar que estamos en la raíz del proyecto
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo -e "${RED}❌ Error: Ejecuta este script desde la raíz del proyecto${NC}"
    exit 1
fi

# 1. Frontend
echo -e "\n${GREEN}📦 Instalando dependencias del frontend...${NC}"
cd frontend
npm install

echo -e "\n${GREEN}🔨 Construyendo frontend...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error en build de frontend${NC}"
    exit 1
fi
cd ..

# 2. Backend
echo -e "\n${GREEN}📦 Instalando dependencias del backend...${NC}"
cd backend
npm install

echo -e "\n${GREEN}🔨 Construyendo backend...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error en build de backend${NC}"
    exit 1
fi
cd ..

# 3. Docker
echo -e "\n${GREEN}🐳 Deteniendo contenedores existentes...${NC}"
docker-compose down

echo -e "\n${GREEN}🗑️  Eliminando volumen de BD (para datos frescos)...${NC}"
docker volume rm mundial2026_mysql_data 2>/dev/null || true

echo -e "\n${GREEN}🚀 Levantando contenedores...${NC}"
docker-compose up -d

# 4. Verificación
echo -e "\n${GREEN}⏳ Esperando que los servicios inicien...${NC}"
sleep 10

echo -e "\n${GREEN}📊 Estado de los contenedores:${NC}"
docker ps

echo -e "\n${GREEN}✅ Despliegue completado!${NC}"
echo -e "${GREEN}📱 Accede a: http://$(hostname -I | awk '{print $1}'):8080${NC}"