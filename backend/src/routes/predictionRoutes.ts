import express from 'express';
import { PredictionController } from '../controllers/predictionController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Protegidas (solo usuarios autenticados)
router.post('/save', authenticateToken, PredictionController.savePrediction);
router.get('/my-prediction', authenticateToken, PredictionController.getMyPrediction);

// Públicas
router.get('/:userCode', PredictionController.getPredictionByCode);
router.get('/ranking/all', PredictionController.getRanking);

export default router;