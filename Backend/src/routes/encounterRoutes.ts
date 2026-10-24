import { Router } from 'express';
import {
  getEncounters,
  getEncounterById,
  createEncounter,
  overrideTriage,
  updateStatus,
  getStats
} from '../controllers/encounterController.js';

const router = Router();

router.get('/', getEncounters);
router.post('/', createEncounter);
router.get('/stats', getStats);
router.get('/:id', getEncounterById);
router.patch('/:id/override', overrideTriage);
router.patch('/:id/status', updateStatus);

export default router;
