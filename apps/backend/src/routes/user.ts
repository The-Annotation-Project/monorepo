import express from "express";
import { signUp, login, protectedRoute } from "../controller/userController";
import { verifyToken } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/signup", signUp);
router.post("/login", login);
router.get("/protected", verifyToken, protectedRoute);

export default router;
