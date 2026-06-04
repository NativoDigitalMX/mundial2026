import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'mundial2026_secret_key_change_in_production';

export interface AuthRequest extends Request {
    user?: {
        id: number;
        user_code: string;
        full_name: string;
        is_admin: boolean;
    };
}

export const generateToken = (user: any): string => {
    return jwt.sign(
        {
            id: user.id,
            user_code: user.user_code,
            full_name: user.full_name,
            is_admin: user.is_admin
        },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
};

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({ error: 'Token de autenticación requerido' });
        return;
    }

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (err) {
            res.status(403).json({ error: 'Token inválido o expirado' });
            return;
        }
        
        req.user = user;
        next();
    });
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user?.is_admin) {
        res.status(403).json({ error: 'Se requieren privilegios de administrador' });
        return;
    }
    next();
};
export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
        
        // 1. Obtener token del header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Token no proporcionado' });
            return;
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
    id: number;           // ← no userId
    user_code: string;    // ← no userCode
    full_name?: string;
    is_admin: boolean;    // ← no isAdmin
    is_active?: boolean;
};

        // 3. Adjuntar usuario al request
        req.user = {
            id: decoded.id,
            user_code: decoded.user_code,
            full_name: '',
            is_admin: decoded.is_admin,

        };

        next();
    } catch (error) {
        console.error('Error de autenticación:', error);
        res.status(401).json({ error: 'Token inválido o expirado' });
    }
};