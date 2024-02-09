import express from "express";
import { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct } from "../controller/productController";
import { verifyToken } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", verifyToken, createProduct);
router.get("/", verifyToken, getAllProducts);
router.get("/:id", verifyToken, getProductById);
router.put("/:id", verifyToken, updateProduct);
router.delete("/:id", verifyToken, deleteProduct);

export default router;
