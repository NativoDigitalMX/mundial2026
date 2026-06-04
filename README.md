
# 🌍 Quiniela Mundial 2026

Aplicación para predicciones del Mundial 2026. Los usuarios pueden predecir resultados de grupos, eliminatorias y campeón.

## 🚀 Despliegue Rápido (Nuevo Servidor)

### 1. Requisitos previos
```bash
# Ubuntu 20.04/22.04
sudo apt update && sudo apt upgrade -y

# Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo apt install docker-compose -y
sudo usermod -aG docker $USER
# Cerrar sesión y volver a entrar

# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
🛠️ Archivos de configuración importantes

 docker-compose.yml - Orquestación de servicio
 nginx.conf - Servidor web / proxy inverso
        
 backend/.env.example - Variables de entorno backend
            
 frontend/.env.example - Variables de entorno frontend
                
📦 Dependencias principales
             
    Frontend: React + TypeScript + Tailwind + Vite
                    
    Backend: Node.js + Express + MySQL

    Infra: Docker + Nginx

🔐 Variables de entorno
Backend (.env)
Frontend (.env)
🤝 Contribuir

    Fork el repositorio

    Crear rama (git checkout -b feature/amazing)
    
    Commit (git commit -m 'Add amazing feature')
        
    Push (git push origin feature/amazing)
            
    Abrir Pull Request
                
 📝 Notas de versión
    v1.0.0 (Marzo 2026)
                
 ✅ Login de usuarios

    ✅ Predicción fase de grupos

    ✅ Predicción eliminatorias (16avos a Final)
    
    ✅ Panel admin

    ✅ Ranking de usuarios

    ✅ Despliegue con Docker
