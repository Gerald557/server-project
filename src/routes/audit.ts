
import { Router } from 'express';
import { GetAuditLogs } from '../controllers/audit';
import { verifyToken } from '../middlewares/auth';

const router = Router();

router.get('/', verifyToken, GetAuditLogs);

export default router;
