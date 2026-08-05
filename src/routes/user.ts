import { Router } from 'express';
import { 
  createUser, 
  getUsers, 
  LoginUser, 
  ResetPassword,
  ForgotPassword
} from '../controllers/user.controller';

const router = Router();

router.post('/forgot-password', ForgotPassword);

router.post('/', createUser);
router.get('/', getUsers);
router.post('/login', LoginUser);
router.post('/reset-password', ResetPassword);

export default router;