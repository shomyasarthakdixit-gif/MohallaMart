import { Router } from "express";
import { getProductsByShopId, getProductById, getMyProducts, createProduct, updateProduct, deleteProduct } from "./product.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { createProductSchema, updateProductSchema } from "../../validators/product.validator";

const router = Router();

router.get("/me", requireAuth, getMyProducts);
router.post("/", requireAuth, validate(createProductSchema), createProduct);
router.put("/:id", requireAuth, validate(updateProductSchema), updateProduct);
router.delete("/:id", requireAuth, deleteProduct);
router.get("/:id", getProductById);
router.get("/", getProductsByShopId);

export default router;
