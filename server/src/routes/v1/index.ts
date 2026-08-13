import { Router } from "express";
import authRoute from "../../modules/auth/auth.route";
import shopRoute from "../../modules/shops/shop.route";
import productRoute from "../../modules/products/product.route";
import orderRoute from "../../modules/orders/order.route";
import cartRoute from "../../modules/cart/cart.route";
import paymentRoute from "../../modules/payments/payment.route";
import userRoute from "../../modules/users/user.routes";
import notificationRoutes from "../../modules/notifications/notification.routes";
import adminRoutes from "../../modules/admin/admin.routes";
import searchRoutes from "../../modules/search/search.routes";
import aiRoutes from "../../modules/ai/ai.routes";
import reviewRoutes from "../../modules/reviews/review.routes";
import couponRoutes from "../../modules/coupons/coupon.routes";

const router = Router();

router.use("/auth", authRoute);
router.use("/shops", shopRoute);
router.use("/products", productRoute);
router.use("/orders", orderRoute);
router.use("/cart", cartRoute);
router.use("/payments", paymentRoute);
router.use("/users", userRoute);
router.use("/notifications", notificationRoutes);
router.use("/admin", adminRoutes);
router.use("/search", searchRoutes);
router.use("/ai", aiRoutes);
router.use("/reviews", reviewRoutes);
router.use("/coupons", couponRoutes);

export default router;
