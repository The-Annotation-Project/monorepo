"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protectedRoute = exports.login = exports.signUp = void 0;
const jwtUtils = __importStar(require("../utils/jwtUtils"));
// Sample user data (for demonstration purposes, you should use a database in a real-world scenario)
const users = [
    { id: 1, username: "user1", password: "password1" },
    { id: 2, username: "user2", password: "password2" },
];
// Signup controller
const signUp = (req, res) => {
    const { username, password } = req.body;
    // Add user to the sample users array (in a real-world scenario, you'd save it to a database)
    const newUser = { id: users.length + 1, username, password };
    users.push(newUser);
    res.json({ message: "User created successfully", user: newUser });
};
exports.signUp = signUp;
// Login controller
const login = (req, res) => {
    const { username, password } = req.body;
    // Find user in the sample users array (in a real-world scenario, you'd query a database)
    const user = users.find((u) => u.username === username && u.password === password);
    if (!user) {
        res.status(401).json({ message: "Invalid username or password" });
        return;
    }
    // Create and sign a JWT
    const token = jwtUtils.signToken({ id: user.id, username: user.username });
    res.json({ message: "Login successful", token });
};
exports.login = login;
// Protected route controller
const protectedRoute = (req, res) => {
    res.json({ message: "This is a protected route", user: req.user });
};
exports.protectedRoute = protectedRoute;
