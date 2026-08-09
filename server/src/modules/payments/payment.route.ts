import { Router } from "express";
import { verifyPayment } from "./payment.controller";
import { requireAuth } from "../../middleware/auth.middleware";

const router = Router();

router.post("/verify", requireAuth, verifyPayment);

export default router;
