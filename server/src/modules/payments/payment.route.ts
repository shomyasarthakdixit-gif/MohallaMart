import { Router } from "express";
import { verifyPayment, handleWebhook } from "./payment.controller";
import { requireAuth } from "../../middleware/auth.middleware";

const router = Router();

router.post("/verify", requireAuth, verifyPayment);
router.post("/webhook", handleWebhook);

export default router;
