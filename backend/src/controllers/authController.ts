import { Request, Response } from 'express';
import { AuthRequest, generateToken } from '../middleware/auth';
import { UserService } from '../services/userService';

export class AuthController {
   
    static async register(req: Request, res: Response): Promise<void> {
        try {
            const { user_code, full_name, password, is_admin } = req.body;
            
            if (!user_code || !full_name || !password) {
                res.status(400).json({ error: 'Faltan campos requeridos' });
                return;
            }
            
            // Validar formato del código (3 caracteres)
            if (user_code.length !== 3) {
                res.status(400).json({ error: 'El código de usuario debe tener 3 caracteres' });
                return;
            }
            
            const user = await UserService.createUser({
                user_code: user_code.toUpperCase(),
                full_name,
                password,
                is_admin: is_admin || false
            });
            
            // No enviar el hash de la contraseña
            // user ya es SafeUser, así que se puede usarlo directamente
            const userResponse = {
                id: user.id,
                user_code: user.user_code,
                full_name: user.full_name,
                is_admin: user.is_admin,
                is_active: user.is_active,
                created_at: user.created_at
            };
            
            res.status(201).json({
                success: true,
                message: 'Usuario registrado exitosamente',
                user: userResponse
            });
            
        } catch (error: any) {
            console.error('Error en registro:', error);
            res.status(400).json({ 
                success: false, 
                error: error.message || 'Error en el registro' 
            });
        }
    }
    
    static async login(req: Request, res: Response): Promise<void> {
        try {
            const { user_code, password } = req.body;
            
            if (!user_code || !password) {
                res.status(400).json({ error: 'Usuario y contraseña requeridos' });
                return;
            }
            
            const user = await UserService.validateLogin({
                user_code: user_code.toUpperCase(),
                password
            });
            
            if (!user) {
                res.status(401).json({ 
                    success: false, 
                    error: 'Credenciales inválidas' 
                });
                return;
            }
            
            const token = generateToken(user);
            
            const userResponse = {
                id: user.id,
                user_code: user.user_code,
                full_name: user.full_name,
                is_admin: user.is_admin,
                is_active: user.is_active
            };
            
            res.json({
                success: true,
                message: 'Login exitoso',
                token,
                user: userResponse
            });
            
        } catch (error: any) {
            console.error('Error en login:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Error en el servidor' 
            });
        }
    }
    
    static async getProfile(req: AuthRequest, res: Response): Promise<void> {
        try {
            const user = await UserService.getUserById(req.user!.id);
            
            if (!user) {
                res.status(404).json({ error: 'Usuario no encontrado' });
                return;
            }
            
            const userResponse = {
                id: user.id,
                user_code: user.user_code,
                full_name: user.full_name,
                is_admin: user.is_admin,
                is_active: user.is_active,
                created_at: user.created_at
            };
            
            res.json({
                success: true,
                user: userResponse
            });
            
        } catch (error: any) {
            console.error('Error obteniendo perfil:', error);
            res.status(500).json({ error: 'Error en el servidor' });
        }
    }
}