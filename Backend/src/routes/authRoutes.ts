import { Router } from 'express';
import { login, getMe, upgradePlan } from '../controllers/authController.js';
import { requireHospitalAuth } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.get('/me', requireHospitalAuth, getMe);
router.post('/upgrade-plan', requireHospitalAuth, upgradePlan);

export default router;
