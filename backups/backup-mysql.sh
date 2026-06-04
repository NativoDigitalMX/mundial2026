#!/bin/bash
# backup-mysql.sh - Respaldo automático de MySQL para Quiniela Mundial 2026

# Configuración
CONTAINER_NAME="mundial2026-mysql"
BACKUP_DIR="/home/javier/apps/mundial2026/backups"
LOG_FILE="/home/javier/apps/mundial2026/backups/logs/backup.log"
DATE=$(date +"%Y%m%d_%H%M%S")
RETENTION_DAYS=30  # Guardar respaldos por 30 días (todo el mundial)

# Colores para output (opcional)
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

# Crear directorios si no existen
mkdir -p "$BACKUP_DIR"
mkdir -p "$(dirname "$LOG_FILE")"

echo "[$(date)] Iniciando respaldo de la base de datos..." | tee -a "$LOG_FILE"

# Verificar que el contenedor está corriendo
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo -e "${RED}[$(date)] ERROR: El contenedor $CONTAINER_NAME no está corriendo${NC}" | tee -a "$LOG_FILE"
    exit 1
fi
        
# Ejecutar mysqldump dentro del contenedo
echo "[$(date)] Exportando base de datos..." | tee -a "$LOG_FILE"
docker exec $CONTAINER_NAME \
  mysqldump -u root -prootpassword \
  --all-databases \
  --single-transaction \
  --routines \
  --triggers \
  --events > "$BACKUP_DIR/backup_$DATE.sql"
    
# Verificar éxito
if [ $? -eq 0 ]; then
   echo -e "${GREEN}[$(date)] ✅ Respaldo exitoso: backup_$DATE.sql${NC}" | tee -a "$LOG_FILE"
            
   # Comprimir para ahorrar espacio
   echo "[$(date)] Comprimiendo archivo..." | tee -a "$LOG_FILE"
   gzip "$BACKUP_DIR/backup_$DATE.sql"
                        
   if [ $? -eq 0 ]; then
      echo -e "${GREEN}[$(date)] ✅ Archivo comprimido: backup_$DATE.sql.gz${NC}" | tee -a "$LOG_FILE"
                
      # Mostrar tamaño del respaldo
      SIZE=$(du -h "$BACKUP_DIR/backup_$DATE.sql.gz" | cut -f1)
         echo "[$(date)] Tamaño del respaldo: $SIZE" | tee -a "$LOG_FILE"
   else
        echo -e "${RED}[$(date)] ❌ Error al comprimir${NC}" | tee -a "$LOG_FILE"
   fi
            
   # Eliminar respaldos antiguos
   echo "[$(date)] Eliminando respaldos de más de $RETENTION_DAYS días..." | tee -a "$LOG_FILE"
   find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
                        
   # Contar respaldos actuales
   COUNT=$(find "$BACKUP_DIR" -name "backup_*.sql.gz" | wc -l)
   echo "[$(date)] 📊 Total de respaldos almacenados: $COUNT" | tee -a "$LOG_FILE"
 else
    echo -e "${RED}[$(date)] ❌ ERROR: Falló el respaldo${NC}" | tee -a "$LOG_FILE"
fi
                                    
echo "[$(date)] Proceso completado" | tee -a "$LOG_FILE"
echo "-----------------------------------" >> "$LOG_FILE"
