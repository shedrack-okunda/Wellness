import express from "express";
import { editUser, getUsers } from "../controllers/userController.js";
const router = express.Router();

router.get("/getUsers", getUsers);
router.post("/editUser", editUser);

export default router;
