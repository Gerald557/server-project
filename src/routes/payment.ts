import { Router } from 'express';
import { CreatePayment, GetPayments, UpdatePaymentStatus, GetLedgerEntries } from '../controllers/payment.controller';
import { verifyToken } from '../middlewares/auth';

const router = Router();

router.post('/', verifyToken, CreatePayment);
router.get('/', GetPayments);
router.put('/:id', verifyToken, UpdatePaymentStatus);
router.get('/ledger', verifyToken, GetLedgerEntries);

export default router;