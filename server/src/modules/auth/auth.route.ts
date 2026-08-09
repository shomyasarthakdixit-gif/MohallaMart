import { Router } from "express";
import { AuthController } from "./auth.controller";

const router = Router();
const authController = new AuthController();

// Login or register user with phone number and Firebase token
router.post("/verify-phone", authController.verifyPhone.bind(authController));

export default router;
