import { Router } from "express";
import { getAddresses, addAddress, deleteAddress } from "./user.controller";
import { requireAuth } from "../../middleware/auth.middleware";

const router = Router();

router.use(requireAuth);

router.get("/addresses", getAddresses);
router.post("/addresses", addAddress);
router.delete("/addresses/:id", deleteAddress);

export default router;
