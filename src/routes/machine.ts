
import { Router } from 'express';
import { CreateMachine, GetMachines } from '../controllers/machine.controller';
import { verifyToken } from '../middlewares/auth';

const router = Router();

router.post('/', verifyToken, CreateMachine);
router.get('/', GetMachines);

export default router;
