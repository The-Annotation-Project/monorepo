import { Response } from "express";
import * as jwtUtils from "../utils/jwtUtils";
import { AuthRequest } from "../@types/types";
import { minioClient } from "../config/minio";
import { v4 as uuid } from "uuid";
import { IUser } from "../modals/User";
import bcrypt from "bcrypt";

const saltRounds = 10;

// Signup controller
export const signUp = async (req: AuthRequest, res: Response): Promise<void> => {
    const { username, password } = req.body;

    const { Bucket } = process.env;

    minioClient.getObject(Bucket!, "users.json", (err, responseObj) => {
        if (err) {
            console.log(err);
            res.status(500).json({ message: "Internal server error" });
        }
        responseObj.on("data", (data) => {
            const allUsers = JSON.parse(data.toString());
            console.log({ allUsers });
            if (!username || !password) {
                res.status(400).json({ message: "Username and password are required" });
                return;
            }
            if (allUsers.find((u: IUser) => u.username === username)) {
                res.status(400).json({ message: "Username already exists" });
                return;
            }
            if (password.length < 6) {
                res.status(400).json({ message: "Password must be at least 6 characters" });
                return;
            }
            if (password.length > 20) {
                res.status(400).json({ message: "Password must be less than 20 characters" });
                return;
            }
            if (!/[A-Z]/.test(password)) {
                res.status(400).json({ message: "Password must contain at least one uppercase letter" });
                return;
            }
            const hashedPassword = bcrypt.hashSync(password, saltRounds);
            let newUsers = [
                {
                    id: uuid(),
                    username,
                    password: hashedPassword,
                },
                ...allUsers,
            ];

            minioClient.putObject(Bucket!, "users.json", JSON.stringify(newUsers), (err) => {
                if (err) {
                    console.log(err);
                }
                console.log("Successfully uploaded users.json");
            });
            res.json({ message: "User created successfully", user: { username } });
        });
        responseObj.on("end", () => {
            console.log("Done");
        });
        responseObj.on("error", (err) => {
            res.status(500).json({ message: "Internal server error" });
            console.log(err);
        });
    });
};

// Login controller
export const login = (req: AuthRequest, res: Response): void => {
    const { username, password } = req.body;
    const { Bucket } = process.env;
    minioClient.getObject(Bucket!, "users.json", (err, responseObj) => {
        if (err) {
            res.status(500).json({ message: "Internal server error" });
        }
        responseObj.on("data", (data) => {
            const users = JSON.parse(data.toString());

            const user = users.find((u: IUser) => u.username === username);

            if (!user) {
                res.status(401).json({ message: "Invalid username" });
                return;
            }
            const planPass = bcrypt.compareSync(password, user.password);
            if (!planPass) {
                res.status(401).json({ message: "Invalid password" });
                return;
            }
            // Create and sign a JWT
            const token = jwtUtils.signToken({ id: user.id, username: user.username });

            res.json({ message: "Login successful", token, username: user.username, userId: user.id });
        });
        responseObj.on("end", () => {
            console.log("Done");
        });
    });
};

// Protected route controller
export const protectedRoute = (req: AuthRequest, res: Response): void => {
    res.json({ message: "This is a protected route", user: req.user });
};
export const currentUser = (req: AuthRequest, res: Response) => {
    res.json({ user: req.user });
};

export const updateUser = (req: AuthRequest, res: Response) => {
    const { Bucket } = process.env;
    const { id } = req.user;
    const { username } = req.body;
    minioClient.getObject(Bucket!, "users.json", (err, responseObj) => {
        responseObj.on("data", (chunk) => {
            const users = JSON.parse(chunk.toString());
            const userIndex = users.findIndex((u: IUser) => u.id === id);
            let newUsers = [...users];
            newUsers[userIndex] = {
                ...users[userIndex],
                username: username,
            };
            minioClient.putObject(Bucket!, "users.json", JSON.stringify(newUsers), (err) => {
                if (err) {
                    console.log(err);
                }
                console.log("Successfully uploaded users.json");
            });
            res.json({ user: { ...newUsers[userIndex], username } });
        });
        responseObj.on("end", () => {
            console.log("Done");
        });
    });
};
