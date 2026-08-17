import { Router } from 'express';
import { CreateWorkOrder, GetWorkOrders, UpdateWorkOrderStatus } from '../controllers/work_order.controller';
import { verifyToken } from '../middlewares/auth';

const router = Router();

router.post('/', verifyToken, CreateWorkOrder);
router.get('/', GetWorkOrders);                 
router.put('/:id', verifyToken, UpdateWorkOrderStatus);

export default router;
