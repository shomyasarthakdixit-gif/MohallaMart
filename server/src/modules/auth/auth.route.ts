import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validate } from "../../middleware/validate.middleware";
import { verifyPhoneSchema } from "../../validators/auth.validator";

const router = Router();
const authController = new AuthController();

/**
 * @openapi
 * /auth/verify-phone:
 *   post:
 *     summary: Verify Firebase ID Token and authenticate user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idToken
 *             properties:
 *               idToken:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully authenticated
 */
// Login or register user with phone number and Firebase token
router.post("/verify-phone", validate(verifyPhoneSchema), authController.verifyPhone.bind(authController));

export default router;
