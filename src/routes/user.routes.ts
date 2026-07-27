import { Router } from 'express';
import { createUser, getUsers } from '../controllers/user.controller';

const router = Router();

// Define mapping endpoints
router.post('/', createUser);
router.get('/', getUsers);

export default router;