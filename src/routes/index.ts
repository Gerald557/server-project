import { Router } from 'express';
import userRoutes from './user';
import machineRouter from './machine';
import inspectionRouter from './inspection';
import faultRouter from './fault';
import workOrderRouter from './work_order';
import sparePartRouter from './spare_part';
import invoiceRouter from './invoice';
import paymentRouter from './payment';

const router = Router();

router.use('/users', userRoutes);
router.use('/machines', machineRouter);
router.use('/inspections', inspectionRouter);
router.use('/faults', faultRouter);
router.use('/work-orders', workOrderRouter);
router.use('/spare-parts', sparePartRouter);
router.use('/invoices', invoiceRouter);
router.use('/payments', paymentRouter);

export default router;