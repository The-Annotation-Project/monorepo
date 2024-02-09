import express from "express";
import { signUp, login, currentUser, updateUser } from "../controller/userController";
import { verifyToken } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/signup", signUp);
router.post("/login", login);
router.get("/me", verifyToken, currentUser);
router.put("/update", verifyToken, updateUser);

export default router;
