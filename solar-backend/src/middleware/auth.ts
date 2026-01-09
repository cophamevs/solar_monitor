import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createError } from './errorHandler.js';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        username: string;
        role: string;
    };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(createError('No token provided', 401, 'UNAUTHORIZED'));
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
            id: string;
            username: string;
            role: string;
        };

        req.user = decoded;
        next();
    } catch {
        return next(createError('Invalid token', 401, 'INVALID_TOKEN'));
    }
}

export function authorize(...roles: string[]) {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(createError('Not authenticated', 401, 'UNAUTHORIZED'));
        }

        if (!roles.includes(req.user.role)) {
            return next(createError('Insufficient permissions', 403, 'FORBIDDEN'));
        }

        next();
    };
}
