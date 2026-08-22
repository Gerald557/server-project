import { Router } from 'express';
import { CreatePayment, GetPayments, UpdatePaymentStatus, CreateLedgerEntry, GetLedgerEntries, GetWalletBalance } from '../controllers/payment';
import { verifyToken } from '../middlewares/auth';

const router = Router();

router.post('/', verifyToken, CreatePayment);
router.get('/', GetPayments);
router.put('/:id', verifyToken, UpdatePaymentStatus);

router.post('/ledger', verifyToken, CreateLedgerEntry);
router.get('/ledger', verifyToken, GetLedgerEntries);       
router.get('/ledger/balance', verifyToken, GetWalletBalance);

export default router;