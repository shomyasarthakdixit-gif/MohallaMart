import { Router } from "express";
import { requireAdmin } from "../../middleware/auth.middleware";
import { 
  getAdminUsers, 
  getAdminShops, 
  updateShopStatus, 
  getAdminOrders, 
  getAdminAnalytics 
} from "./admin.controller";

const router = Router();

// All routes in this file require ADMIN role
router.use(requireAdmin);

router.get("/users", getAdminUsers);
router.get("/shops", getAdminShops);
router.put("/shops/:id/status", updateShopStatus);
router.get("/orders", getAdminOrders);
router.get("/analytics", getAdminAnalytics);

export default router;
