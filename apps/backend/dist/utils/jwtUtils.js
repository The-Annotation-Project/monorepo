"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.signToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Secret key for JWT (you should keep this secret and not hardcode it in a real application)
const secretKey = "your_secret_key";
// Sign JWT
const signToken = (payload) => jsonwebtoken_1.default.sign(payload, secretKey, { expiresIn: "1h" });
exports.signToken = signToken;
// Verify JWT
const verifyToken = (token) => new Promise((resolve, reject) => {
    jsonwebtoken_1.default.verify(token, secretKey, (err, decoded) => {
        if (err) {
            reject(err);
        }
        else {
            resolve(decoded);
        }
    });
});
exports.verifyToken = verifyToken;
