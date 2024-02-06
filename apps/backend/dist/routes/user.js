"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controller/userController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.post("/signup", userController_1.signUp);
router.post("/login", userController_1.login);
router.get("/protected", authMiddleware_1.verifyToken, userController_1.protectedRoute);
exports.default = router;
