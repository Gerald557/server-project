import { Router } from 'express';
import { CreateInvoice, GetInvoices, UpdateInvoiceStatus } from '../controllers/invoice';
import { verifyToken } from '../middlewares/auth';

const router = Router();

router.post('/', verifyToken, CreateInvoice);
router.get('/', GetInvoices);                       
router.put('/:id', verifyToken, UpdateInvoiceStatus);

export default router;