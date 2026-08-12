
import { Router } from 'express';
import { CreateMachine, GetMachines, UpdateMachine } from '../controllers/machine.controller';
import { verifyToken } from '../middlewares/auth';

const router = Router();

router.post('/', verifyToken, CreateMachine);
router.get('/', GetMachines);
router.put('/:id', verifyToken, UpdateMachine);

export default router;
