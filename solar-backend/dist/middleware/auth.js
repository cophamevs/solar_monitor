"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.authorize = authorize;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorHandler_js_1 = require("./errorHandler.js");
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next((0, errorHandler_js_1.createError)('No token provided', 401, 'UNAUTHORIZED'));
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = decoded;
        next();
    }
    catch {
        return next((0, errorHandler_js_1.createError)('Invalid token', 401, 'INVALID_TOKEN'));
    }
}
function authorize(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return next((0, errorHandler_js_1.createError)('Not authenticated', 401, 'UNAUTHORIZED'));
        }
        if (!roles.includes(req.user.role)) {
            return next((0, errorHandler_js_1.createError)('Insufficient permissions', 403, 'FORBIDDEN'));
        }
        next();
    };
}
//# sourceMappingURL=auth.js.map