import { Router } from "express";
import { getShoppingAssistant, getRecommendations } from "./ai.controller";
import { requireAuth } from "../../middleware/auth.middleware";

const router = Router();

router.post("/assistant", getShoppingAssistant);
router.get("/recommendations", requireAuth, getRecommendations);

export default router;
