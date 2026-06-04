import express from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateToken, generateToken } from '../middleware/auth';

const router = express.Router();

// Públicas
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Login para administrador (PÚBLICA - sin authenticateToken)
router.post('/admin-login', (req, res) => {
    try {
        const { user_code, password } = req.body;
        
        // 1. Verificar credenciales admin desde .env
        const adminUserCode = process.env.ADMIN_USERCODE;
        const adminPassword = process.env.ADMIN_PASSWORD;
        if (!user_code || !password) {
            return res.status(400).json({ error: 'Código y contraseña requeridos' });
        }
        
        if (user_code.toUpperCase() !== adminUserCode || password !== adminPassword) {
            return res.status(401).json({ error: 'Credenciales de administrador inválidas' });
        }
        
        // 2. Crear objeto usuario admin
        const adminUser = {
            id: 0,
            user_code: adminUserCode,
            full_name: 'Administrador del Sistema',
            is_admin: true,
            is_active: true
        };
        
        // 3. Generar token
        const token = generateToken(adminUser);
        // 4. Responder
        res.json({
            success: true,
            token,
            user: adminUser,
            message: 'Login de administrador exitoso'
        });
        
    } catch (error) {
        console.error('Error en admin-login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});
// Protegidas
router.get('/profile', authenticateToken, AuthController.getProfile);

export default router;