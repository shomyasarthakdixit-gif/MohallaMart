import { Router } from "express";
import { createOrder, getShopOrders, updateOrderStatus, getMyOrders, getOrderById, cancelOrder, getShopAnalytics } from "./order.controller";
import { requireAuth, requireShopkeeper } from "../../middleware/auth.middleware";

const router = Router();

router.post("/", requireAuth, createOrder);
router.get("/shop", requireAuth, requireShopkeeper, getShopOrders);
router.get("/shop/analytics", requireAuth, requireShopkeeper, getShopAnalytics);
router.get("/me", requireAuth, getMyOrders);
router.get("/:id", requireAuth, getOrderById);
router.patch("/:id/status", requireAuth, requireShopkeeper, updateOrderStatus);
router.post("/:id/cancel", requireAuth, cancelOrder);

export default router;
