import { Router } from "express";
import { getNearbyShops, getShopById, createShop, deleteShop, getMyShop, updateMyShop } from "./shop.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { createShopSchema, updateShopSchema } from "../../validators/shop.validator";

const router = Router();

router.post("/", requireAuth, validate(createShopSchema), createShop);
router.delete("/", requireAuth, deleteShop);
router.get("/me", requireAuth, getMyShop);
router.put("/me", requireAuth, validate(updateShopSchema), updateMyShop);
router.get("/nearby", getNearbyShops);
router.get("/:id", getShopById);

export default router;
