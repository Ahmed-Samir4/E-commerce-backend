
import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import * as authController from './auth.controller.js';
const router = Router();


router.post('/', expressAsyncHandler(authController.signUp))
router.get('/verify-email', expressAsyncHandler(authController.verifyEmail))


router.post('/login', expressAsyncHandler(authController.signIn))



export default router;