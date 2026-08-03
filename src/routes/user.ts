import { Router } from 'express';
import { 
  createUser, 
  getUsers, 
  loginUser, 
  resetPassword 
} from '../controllers/user.controller';

const router = Router();

// Register all user endpoints
router.post('/', createUser);
router.get('/', getUsers);
router.post('/login', loginUser);
router.post('/reset-password', resetPassword);

export default router;