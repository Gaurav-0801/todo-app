import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
// middleware.ts
const JWT_PASSWORD = process.env.JWT_PASSWORD!;

export function authenticate(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    

    try {
        const decoded = jwt.verify(token, JWT_PASSWORD) as { userId: string };
        (req as any).user = decoded; 
        next();
        

    } catch (err) {
        return res.status(403).json({ message: "Invalid token" });
        
    }
}
