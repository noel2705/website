import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export function createJWT(payload: any) {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: "7d",
    });
}

export function verifyJWT(token: string): MyJwtPayload {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (typeof decoded === "string") {
        throw new Error("Ungültiger JWT Payload");
    }

    return decoded as MyJwtPayload;
}

export interface MyJwtPayload {
    sub: string;
    role: string;
    [key: string]: any;
}