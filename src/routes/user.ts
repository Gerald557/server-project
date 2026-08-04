import { Router } from 'express';
import { 
  createUser, 
  getUsers, 
  loginUser, 
  resetPassword,
  forgotPassword
} from '../controllers/user.controller';

const router = Router();

router.post('/forgot-password', forgotPassword);

router.post('/', createUser);
router.get('/', getUsers);
router.post('/login', loginUser);
router.post('/reset-password', resetPassword);

export default router;