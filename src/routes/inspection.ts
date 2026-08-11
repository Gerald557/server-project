
import { Router } from 'express';
import { CreateInspection, GetInspections } from '../controllers/inspection.controller';
import { verifyToken } from '../middlewares/auth';

const router = Router();

router.post('/', verifyToken, CreateInspection);
router.get('/', GetInspections);

export default router;
