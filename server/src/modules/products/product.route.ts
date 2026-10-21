import { Router } from "express";
import { getProductsByShopId, getProductById, getMyProducts, createProduct, updateProduct, deleteProduct } from "./product.controller";
import { requireAuth, requireShopkeeper } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { createProductSchema, updateProductSchema } from "../../validators/product.validator";

const router = Router();

router.get("/me", requireAuth, getMyProducts);
router.post("/", requireAuth, requireShopkeeper, validate(createProductSchema), createProduct);
router.put("/:id", requireAuth, requireShopkeeper, validate(updateProductSchema), updateProduct);
router.delete("/:id", requireAuth, requireShopkeeper, deleteProduct);
router.get("/:id", getProductById);
router.get("/", getProductsByShopId);

export default router;
