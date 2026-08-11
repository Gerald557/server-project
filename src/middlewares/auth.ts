
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ 
        success: false, 
        message: "Access Denied! No token provided." 
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, JWT_SECRET) as { id?: string };
    if (!decoded || typeof decoded !== 'object' || !decoded.id) {
      res.status(401).json({
        success: false,
        message: 'Access Denied! Invalid token payload.'
      });
      return;
    }

    (req as any).user = decoded;

    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: "Access Denied! Invalid or expired token." 
    });
  }
};
