import { Router } from 'express';
import { CreateWorkOrder, GetWorkOrders, UpdateWorkOrderStatus } from '../controllers/workOrder';
import { verifyToken } from '../middlewares/auth';

const router = Router();

router.post('/', verifyToken, CreateWorkOrder);
router.get('/', GetWorkOrders);                 
router.put('/:id', verifyToken, UpdateWorkOrderStatus);

export default router;
