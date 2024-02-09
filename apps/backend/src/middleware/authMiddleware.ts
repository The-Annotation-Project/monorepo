import { Request, Response, NextFunction } from "express";
import * as jwtUtils from "../utils/jwtUtils";
import { AuthRequest } from "../@types/types";

// Middleware to verify JWT
export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const token = req.headers["authorization"];

    if (!token) {
        res.status(403).json({ message: "No token provided" });
        return;
    }

    jwtUtils
        .verifyToken(token)
        .then((decoded) => {
            req.user = decoded;
            next();
        })
        .catch(() => {
            res.status(401).json({ message: "Failed to authenticate token" });
        });
};
