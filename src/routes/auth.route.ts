import express from 'express';
import authMiddleware from '../middleware/auth.middleware';
import authController from '../controllers/auth.controller';

const authRouter = express.Router();

authRouter.post('/login', authController.login);
authRouter.post('/reset', authController.reset);
authRouter.post('/forgot', authController.forgot);
authRouter.post('/register', authController.register);
authRouter.post('/checkEmail', authController.checkEmail);
authRouter.get('/me', authMiddleware.authenticateVerifiedAccessToken, authController.me);
authRouter.post('/refresh', authMiddleware.authenticateRefreshToken, authController.refresh);
authRouter.post('/logout', authMiddleware.authenticateVerifiedAccessToken, authController.logout);
authRouter.post('/verify', authMiddleware.authenticateUnverifiedAccessToken, authController.verify);
authRouter.post('/reverify', authMiddleware.authenticateUnverifiedAccessToken, authController.reverify);

export default authRouter;
