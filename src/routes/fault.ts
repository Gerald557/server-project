
import { Router } from 'express';
import { CreateFault, GetFaults } from '../controllers/fault.controller';
import { verifyToken } from '../middlewares/auth';

const router = Router();

router.post('/', verifyToken, CreateFault);
router.get('/', GetFaults);                

export default router;