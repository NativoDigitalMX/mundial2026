import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
    // Primero debe pasar por authMiddleware
   
    if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
    }

    // Verificar si es admin
    if (!req.user.is_admin) {
        res.status(403).json({ 
            error: 'Acceso denegado. Se requieren permisos de administrador' 
        });
        return;
    }

    next();
};