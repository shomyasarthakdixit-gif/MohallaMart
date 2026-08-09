import { Router } from "express";
import { getCart, addToCart, clearCart } from "./cart.controller";
import { requireAuth } from "../../middleware/auth.middleware";

const router = Router();

router.use(requireAuth);

router.get("/", getCart);
router.post("/item", addToCart);
router.delete("/", clearCart);

export default router;
