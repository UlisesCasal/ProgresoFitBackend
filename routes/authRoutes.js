import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

//POST /auth/register - Registro
router.post('/register', authController.registerController);

//POST /auth/login - Login
router.post('/login', authController.loginController);

//POST /auth/logout - Logout
router.post('/logout', authenticateToken, authController.logoutController);

export default router;
