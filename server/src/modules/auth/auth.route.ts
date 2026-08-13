import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validate } from "../../middleware/validate.middleware";
import { verifyPhoneSchema } from "../../validators/auth.validator";

const router = Router();
const authController = new AuthController();

// Login or register user with phone number and Firebase token
router.post("/verify-phone", validate(verifyPhoneSchema), authController.verifyPhone.bind(authController));

export default router;
