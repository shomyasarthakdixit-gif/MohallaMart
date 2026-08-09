import { Router } from "express";
import { getNearbyShops, getShopById, createShop, deleteShop, getMyShop, updateMyShop } from "./shop.controller";
import { requireAuth } from "../../middleware/auth.middleware";

const router = Router();

router.post("/", requireAuth, createShop);
router.delete("/", requireAuth, deleteShop);
router.get("/me", requireAuth, getMyShop);
router.put("/me", requireAuth, updateMyShop);
router.get("/nearby", getNearbyShops);
router.get("/:id", getShopById);

export default router;
