import { Router } from "express";
import { validateCoupon, createCoupon } from "./coupon.controller";
import { requireAuth } from "../../middleware/auth.middleware";

const router = Router();

// Publicly accessible for any user to validate a code
router.post("/validate", requireAuth, validateCoupon);

// Should ideally be admin only, but restricting to auth for now
router.post("/", requireAuth, createCoupon);

export default router;
