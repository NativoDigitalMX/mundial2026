# 🌍 Quiniela Mundial 2026

Aplicación para predicciones del Mundial 2026. Los usuarios pueden predecir resultados de grupos, eliminatorias y campeón.

## 🛠️ Stack

- **Frontend:** React + TypeScript + Tailwind + Vite
- **Backend:** Node.js + Express + MySQL
- **Infra:** Docker + Nginx

---

## 💻 Levantar en local

### 1. Requisitos previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Node.js 18+

### 2. Clonar el repo

```bash
git clone https://github.com/NativoDigitalMX/mundial2026.git
cd mundial2026
```

### 3. Configurar variables de entorno

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

> Edita `backend/.env` y `frontend/.env` con tus valores si es necesario. Los valores por defecto funcionan para desarrollo local.

### 4. Levantar backend y base de datos con Docker

```bash
docker-compose up -d
```

Esto levanta MySQL y el backend en `http://localhost:3001`.

### 5. Levantar el frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend estará disponible en `http://localhost:5173`.

---

## 🔐 Variables de entorno

### Backend (`backend/.env`)

| Variable | Descripción | Default |
|----------|-------------|---------|
| `DB_HOST` | Host de MySQL | `127.0.0.1` |
| `DB_PORT` | Puerto de MySQL (Docker) | `3308` |
| `DB_USER` | Usuario de MySQL | `mundial_user` |
| `DB_PASSWORD` | Password de MySQL | `mundial_pass` |
| `DB_NAME` | Nombre de la base de datos | `mundial2026` |
| `JWT_SECRET` | Secret para JWT | — |
| `PORT` | Puerto del backend | `3001` |
| `ADMIN_USERCODE` | Código del admin | `ADM` |
| `ADMIN_PASSWORD` | Password del admin | — |

### Frontend (`frontend/.env`)

| Variable | Descripción | Default |
|----------|-------------|---------|
| `VITE_API_URL` | URL del backend | `http://localhost:3001` |
| `VITE_ADMIN_USERCODE` | Código del admin | `ADM` |
| `VITE_ADMIN_PASSWORD` | Password del admin | — |

---

## 🚀 Despliegue en producción (AWS Lightsail)

### 1. Requisitos en el servidor

```bash
# Ubuntu 22.04
sudo apt update && sudo apt upgrade -y

# Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo apt install docker-compose -y
sudo usermod -aG docker $USER
# Cerrar sesión y volver a entrar para aplicar permisos
```

### 2. Clonar y configurar

```bash
git clone https://github.com/NativoDigitalMX/mundial2026.git /home/ubuntu/mundial2026
cd /home/ubuntu/mundial2026
cp backend/.env.example backend/.env
# Editar backend/.env con valores de producción
```

### 3. Generar certificados SSL

```bash
mkdir -p ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/privkey.pem -out ssl/fullchain.pem -subj "/CN=tudominio.com"
```

> Para SSL real con Let's Encrypt:
> ```bash
> sudo apt install certbot -y
> sudo docker-compose stop nginx
> sudo certbot certonly --standalone -d tudominio.com -d www.tudominio.com
> sudo cp /etc/letsencrypt/live/tudominio.com/fullchain.pem ssl/
> sudo cp /etc/letsencrypt/live/tudominio.com/privkey.pem ssl/
> sudo docker-compose start nginx
> ```

### 4. Build del frontend

El `frontend/dist` se genera en local y se sube al repo:

```bash
# En tu máquina local
cd frontend
npm run build
cd ..
git add -f frontend/dist
git commit -m "build: update frontend dist"
git push
```

### 5. Levantar en producción

```bash
sudo docker-compose up -d --build
```

---

## 📁 Archivos importantes

| Archivo | Descripción |
|---------|-------------|
| `docker-compose.yml` | Orquestación de servicios |
| `nginx.conf` | Servidor web / proxy inverso |
| `backend/.env.example` | Variables de entorno backend |
| `frontend/.env.example` | Variables de entorno frontend |
| `docker/mysql/init.sql` | Schema e inicialización de la DB |

---

## 🤝 Contribuir

1. Fork el repositorio
2. Crear rama: `git checkout -b feature/mi-feature`
3. Commit: `git commit -m 'feat: agregar mi feature'`
4. Push: `git push origin feature/mi-feature`
5. Abrir Pull Request

---

## 📝 Changelog

### v1.0.0 (Marzo 2026)
- ✅ Login de usuarios
- ✅ Predicción fase de grupos
- ✅ Predicción eliminatorias (16avos a Final)
- ✅ Panel admin
- ✅ Ranking de usuarios
- ✅ Despliegue con Docker
