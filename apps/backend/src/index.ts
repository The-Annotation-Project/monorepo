import "dotenv/config";
import express, { Request, Response } from "express";
import userRoutes from "./routes/user";
import productRoutes from "./routes/product";
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
    res.send("Hello, TypeScript Express!");
});

app.use("/user", userRoutes);
app.use("/products", productRoutes);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
