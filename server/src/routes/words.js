import { Router } from "express";
import { getRandomWord, listWords } from "../controllers/wordsController.js";

const router = Router();

router.get("/words", listWords);
router.get("/random-word", getRandomWord);

export default router;
