import express from "express";
import { createToken, stkPush } from "../controllers/ebookController.js";
const router = express.Router();

router.post("/process-payment", createToken, stkPush);

export default router;
