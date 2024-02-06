import { Response, Request } from "express";
import { minioClient } from "../config/minio";
import { v4 as uuidv4 } from "uuid";
import { IProduct } from "../modals/Product";
const modelName = "products.json";
const { Bucket } = process.env;
export const createProduct = async (req: Request, res: Response): Promise<void> => {
    const { name, description, price } = req.body;
    if (!name || !description || !price) {
        res.status(400).json({ message: "Please provide all required fields" });
        return;
    }

    minioClient.getObject(Bucket!, modelName, (err, responseObj) => {
        if (err) {
            res.json({ message: "Internal server error", error: err });
            return console.log(err);
        }
        responseObj.on("data", (chunk) => {
            const data = JSON.parse(chunk.toString());
            console.log(chunk.toString());
            let newProduct = { name, description, price, id: uuidv4() };
            data.push(newProduct);

            minioClient.putObject(Bucket!, modelName, JSON.stringify(data), (err, objInfo) => {
                if (err) {
                    return console.log(err);
                }
                console.log("Success", objInfo);
                res.status(201).json({ message: "Product created successfully", product: newProduct });
            });
        });
        responseObj.on("end", () => {
            console.log("DONE");
        });
        responseObj.on("error", (err) => {
            console.log(err);
            res.json({ message: "Internal server error", error: err });
        });
    });
};

// Get all products
export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
    minioClient.getObject(Bucket!, modelName, (err, responseObj) => {
        if (err) {
            res.json({ message: "Internal server error", error: err });
            return console.log(err);
        }
        responseObj.on("data", (chunk) => {
            res.status(200).json({ products: JSON.parse(chunk.toString()) });
        });
        responseObj.on("end", () => {
            console.log("DONE");
        });
        responseObj.on("error", (err) => {
            console.log(err);
            res.json({ message: "Internal server error", error: err });
        });
    });
};

// Get a single product by ID
export const getProductById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    if (!id) {
        res.json({ message: "Please provide product id" });
        return;
    }
    minioClient.getObject(Bucket!, modelName, (err, responseObj) => {
        if (err) {
            res.json({ message: "Internal server error", error: err });
            return console.log(err);
        }
        responseObj.on("data", (chunk) => {
            const data = JSON.parse(chunk.toString());

            const product = data.find((product: any) => product.id === id);
            console.log(product);
            if (!product) {
                res.status(404).json({ message: "Product not found" });
                return;
            }
            res.status(200).json({ product });
        });
        responseObj.on("end", () => {
            console.log("DONE");
        });
        responseObj.on("error", (err) => {
            console.log(err);
            res.json({ message: "Internal server error", error: err });
        });
    });
};

// Update a product
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { name, description, price } = req.body;
    minioClient.getObject(Bucket!, modelName, (err, responseObj) => {
        if (err) {
            res.json({ message: "Internal server error", error: err });
            return console.log(err);
        }
        responseObj.on("data", (chunk) => {
            const data = JSON.parse(chunk.toString());
            const productIndex = data.findIndex((product: IProduct) => product.id === id);
            data[productIndex] = { name, description, price, id };
            minioClient.putObject(Bucket!, modelName, JSON.stringify(data), (err, objInfo) => {
                if (err) {
                    return console.log(err);
                }
                console.log("Success", objInfo);
                res.status(201).json({ message: "Product updated successfully", product: data[productIndex] });
            });
        });
    });
};

// Delete a product
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    if (!id) {
        res.status(400).json({ message: "Please provide product id" });
        return;
    }
    minioClient.getObject(Bucket!, modelName, (err, responseObj) => {
        if (err) {
            res.json({ message: "Internal server error", error: err });
            return console.log(err);
        }
        responseObj.on("data", (chunk) => {
            const data = JSON.parse(chunk);
            const isProduct = data.find((product: IProduct) => product.id === id);
            if (!isProduct) {
                res.status(404).json({ message: "Product not found" });
                return;
            }
            const newData = data.filter((product: IProduct) => product.id !== id);
            minioClient.putObject(Bucket!, modelName, JSON.stringify(newData), (err, objInfo) => {
                if (err) {
                    res.json({ message: "Internal server error", error: err });
                    return console.log(err);
                }
                console.log("Success", objInfo);
                res.status(201).json({ message: "Product deleted successfully", product: newData });
            });
        });
    });
};
