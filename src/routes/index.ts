import { Router } from 'express';
import userRoutes from './user';
import machineRouter from './machine';
import inspectionRouter from './inspection';
import faultRouter from './fault';
import workOrderRouter from './workaOrder';
import sparePartRouter from './sparePart';
import invoiceRouter from './invoice';
import paymentRouter from './payment';
import auditRouter from './audit';

const router = Router();

router.use('/users', userRoutes);
router.use('/machines', machineRouter);
router.use('/inspections', inspectionRouter);
router.use('/faults', faultRouter);
router.use('/work-orders', workOrderRouter);
router.use('/spare-parts', sparePartRouter);
router.use('/invoices', invoiceRouter);
router.use('/payments', paymentRouter);
router.use('/audit-logs', auditRouter);

export default router;