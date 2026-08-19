
import { Router } from 'express';
import { CreateFault, GetFaults, ValidateFault } from '../controllers/fault.controller';
import { verifyToken } from '../middlewares/auth';

const router = Router();

router.post('/', verifyToken, CreateFault);
router.get('/', GetFaults);
router.put('/:id', verifyToken, ValidateFault);

export default router;
