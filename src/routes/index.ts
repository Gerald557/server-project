import { Router } from 'express';
import userRoutes from './user';
import machineRouter from './machine';
import inspectionRouter from './inspection';
import faultRouter from './fault';

const router = Router();

router.use('/users', userRoutes);
router.use('/api/machines', machineRouter);
router.use('/api/inspections', inspectionRouter);
router.use('/api/faults', faultRouter);

export default router;