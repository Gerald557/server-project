
import { Router } from 'express';
import userRoutes from './user';
import machineRouter from './machine';
import inspectionRouter from './inspection';
import faultRouter from './fault';

const router = Router();

router.use('/users', userRoutes);
router.use('/machines', machineRouter);
router.use('/inspections', inspectionRouter);
router.use('/faults', faultRouter);

export default router;