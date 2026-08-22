
import { Router } from 'express';
import { CreateSparePart, GetSpareParts, AddPartToWorkOrder } from '../controllers/sparePart';
import { verifyToken } from '../middlewares/auth';

const router = Router();

router.post('/', verifyToken, CreateSparePart);
router.get('/', GetSpareParts);                
router.post('/checkout', verifyToken, AddPartToWorkOrder);

export default router;
