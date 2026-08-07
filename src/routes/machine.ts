
import { Router } from 'express';
import { CreateMachine } from '../controllers/machine.controller';

const router = Router();

router.post('/', CreateMachine);

export default router;
