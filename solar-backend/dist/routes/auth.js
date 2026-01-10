"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_js_1 = require("../index.js");
const errorHandler_js_1 = require("../middleware/errorHandler.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
// Login
router.post('/login', async (req, res, next) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            throw (0, errorHandler_js_1.createError)('Username and password required', 400, 'VALIDATION_ERROR');
        }
        const user = await index_js_1.prisma.user.findUnique({
            where: { username }
        });
        if (!user) {
            throw (0, errorHandler_js_1.createError)('Invalid credentials', 401, 'INVALID_CREDENTIALS');
        }
        const isValid = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isValid) {
            throw (0, errorHandler_js_1.createError)('Invalid credentials', 401, 'INVALID_CREDENTIALS');
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    }
    catch (error) {
        next(error);
    }
});
// Get current user
router.get('/me', auth_js_1.authenticate, async (req, res, next) => {
    try {
        const user = await index_js_1.prisma.user.findUnique({
            where: { id: req.user?.id },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                createdAt: true
            }
        });
        if (!user) {
            throw (0, errorHandler_js_1.createError)('User not found', 404, 'USER_NOT_FOUND');
        }
        res.json(user);
    }
    catch (error) {
        next(error);
    }
});
// Register (admin only in production)
router.post('/register', async (req, res, next) => {
    try {
        const { username, email, password, role = 'OPERATOR' } = req.body;
        if (!username || !password) {
            throw (0, errorHandler_js_1.createError)('Username and password required', 400, 'VALIDATION_ERROR');
        }
        const existing = await index_js_1.prisma.user.findFirst({
            where: {
                OR: [
                    { username },
                    { email: email || undefined }
                ]
            }
        });
        if (existing) {
            throw (0, errorHandler_js_1.createError)('Username or email already exists', 409, 'USER_EXISTS');
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const user = await index_js_1.prisma.user.create({
            data: {
                username,
                email,
                passwordHash,
                role
            },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                createdAt: true
            }
        });
        res.status(201).json(user);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map