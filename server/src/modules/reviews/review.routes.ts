import { Router } from "express";
import { createReview, getReviews } from "./review.controller";
import { requireAuth } from "../../middleware/auth.middleware";

const router = Router();

router.post("/", requireAuth, createReview);
router.get("/", getReviews);

export default router;
