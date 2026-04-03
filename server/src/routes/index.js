import { Router } from "express";
import healthRoutes from "./health.js";
import playersRoutes from "./players.js";
import wordsRoutes from "./words.js";

const router = Router();

router.use(healthRoutes);
router.use(playersRoutes);
router.use(wordsRoutes);

export default router;
