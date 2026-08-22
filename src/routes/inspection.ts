
import { Router } from 'express';
import { CreateInspection, GetInspections, UpdateInspection } from '../controllers/inspection';
import { verifyToken } from '../middlewares/auth';

const router = Router();

router.post('/', verifyToken, CreateInspection);
router.get('/', GetInspections);
router.put('/:id', verifyToken, UpdateInspection);

export default router;
