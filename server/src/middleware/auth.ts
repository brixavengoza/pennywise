import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JwtPayload } from '../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// Verify JWT token from Authorization header
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);
    req.user = payload;
    
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
};
