import express from 'express';
import { AdminController } from '../controllers/adminController';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/adminMiddleware';
const router = express.Router();

// Todas las rutas requieren autenticación y ser admin
// Ver todos los usuarios
router.get('/users', AdminController.getAllUsers);
router.post('/users', AdminController.createUser);     
router.put('/users/:id', AdminController.updateUser);  
router.delete('/users/:id', AdminController.deleteUser); 

router.post('/users', AdminController.createUser);     
router.put('/users/:id', AdminController.updateUser);  
router.delete('/users/:id', AdminController.deleteUser);
// Obtener predicción de un usuario
router.get('/users/:id/prediction', AdminController.getUserPrediction); 
// ====== RUTAS PARA RESULTADOS REALES (FASES) ======
router.post('/phase-results', authMiddleware, adminMiddleware, AdminController.savePhaseResults);
router.get('/phase-results', authMiddleware, adminMiddleware, AdminController.getPhaseResults);
router.get('/phase-results/:stage', authMiddleware, adminMiddleware, AdminController.getPhaseResults);
router.get('/phase-teams/:stage', authMiddleware, adminMiddleware, AdminController.getQualifiedTeams);
router.get('/phase-validation', authMiddleware, adminMiddleware, AdminController.getPhaseValidation);

// Obtener estadísticas administrativas
router.get('/stats', AdminController.getStats);
router.get('/all-predictions', authMiddleware, adminMiddleware, AdminController.getAllPredictions);
router.get('/users/:id/prediction', AdminController.getUserPrediction);
router.post('/recalculate-points', authMiddleware, adminMiddleware, AdminController.recalculateAllPoints); 
export default router;