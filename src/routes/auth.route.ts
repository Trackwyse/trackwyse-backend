import express from 'express';
import authMiddleware from '../middleware/auth.middleware';
import authController from '../controllers/auth.controller';

const authRouter = express.Router();

authRouter.post('/login', authController.login);
authRouter.post('/register', authController.register);
authRouter.post('/refresh', authMiddleware.authenticateRefreshToken, authController.refresh);
authRouter.post('/logout', authMiddleware.authenticateVerifiedAccessToken, authController.logout);
authRouter.post('/verify', authMiddleware.authenticateUnverifiedAccessToken, authController.verify);
authRouter.post('/reverify', authMiddleware.authenticateUnverifiedAccessToken, authController.reverify);

export default authRouter;
