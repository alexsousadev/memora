import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

export const authRouter = Router();
const authController = new AuthController();

authRouter.post('/register/options', (req, res) => authController.registerOptions(req, res));
authRouter.post('/register/verify', (req, res) => authController.verifyRegister(req, res));
authRouter.post('/login/options', (req, res) => authController.loginOptions(req, res));
authRouter.post('/login/verify', (req, res) => authController.verifyLogin(req, res));

