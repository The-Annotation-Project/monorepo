import jwt from "jsonwebtoken";

// Secret key for JWT (you should keep this secret and not hardcode it in a real application)
const secretKey = "pasjidfpdsaifjsadifpajsfdjfk;jfpsfjpsia";

// Sign JWT
export const signToken = (payload: object): string => jwt.sign(payload, secretKey, { expiresIn: "2h" });

// Verify JWT
export const verifyToken = (token: string): Promise<object> =>
    new Promise((resolve, reject) => {
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                reject(err);
            } else {
                resolve(decoded as object);
            }
        });
    });
