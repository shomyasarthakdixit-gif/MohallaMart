import { Router } from "express";
import { globalSearch } from "./search.controller";
import { requireAuth } from "../../middleware/auth.middleware";

const router = Router();

// We can make search require auth to ensure we have the user's default location, 
// or allow public search if lat/lng are provided in query. Let's make it public for now
// and let the frontend pass the lat/lng.
router.get("/", globalSearch);

export default router;
