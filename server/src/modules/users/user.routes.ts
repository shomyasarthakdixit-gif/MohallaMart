import { Router } from "express";
import { getAddresses, addAddress, deleteAddress, getUserInsights, getProfile } from "./user.controller";
import { requireAuth } from "../../middleware/auth.middleware";

const router = Router();

router.use(requireAuth);

router.get("/me", requireAuth, getProfile);
router.get("/addresses", requireAuth, getAddresses);
router.post("/addresses", requireAuth, addAddress);
router.delete("/addresses/:id", requireAuth, deleteAddress);
router.get("/me/insights", requireAuth, getUserInsights);

export default router;
