import { Router } from "express";
import { getProductsByShopId, getMyProducts, createProduct, updateProduct, deleteProduct } from "./product.controller";
import { requireAuth } from "../../middleware/auth.middleware";

const router = Router();

router.get("/me", requireAuth, getMyProducts);
router.post("/", requireAuth, createProduct);
router.put("/:id", requireAuth, updateProduct);
router.delete("/:id", requireAuth, deleteProduct);
router.get("/", getProductsByShopId);

export default router;
