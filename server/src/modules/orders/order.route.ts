import { Router } from "express";
import { createOrder, getShopOrders, updateOrderStatus, getMyOrders, getOrderById, cancelOrder } from "./order.controller";
import { requireAuth } from "../../middleware/auth.middleware";

const router = Router();

router.post("/", requireAuth, createOrder);
router.get("/shop", requireAuth, getShopOrders);
router.get("/me", requireAuth, getMyOrders);
router.get("/:id", requireAuth, getOrderById);
router.patch("/:id/status", requireAuth, updateOrderStatus);
router.post("/:id/cancel", requireAuth, cancelOrder);

export default router;
