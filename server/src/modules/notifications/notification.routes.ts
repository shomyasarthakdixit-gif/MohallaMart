import { Router } from "express";
import { getMyNotifications, markAsRead, markAllAsRead } from "./notification.controller";
import { requireAuth } from "../../middleware/auth.middleware";

const router = Router();

router.use(requireAuth);

router.get("/", getMyNotifications);
router.put("/read-all", markAllAsRead);
router.put("/:id/read", markAsRead);

export default router;
