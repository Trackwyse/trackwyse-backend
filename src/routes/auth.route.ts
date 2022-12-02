import express from 'express';
import authMiddleware from '../middleware/auth.middleware';
import authController from '../controllers/auth.controller';

const authRouter = express.Router();

authRouter.post('/login', authController.login);
authRouter.post('/register', authController.register);
authRouter.post('/refresh', authMiddleware.authenticateRefreshToken, authController.refresh);

export default authRouter;
