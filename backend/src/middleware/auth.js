import { verifyJWT, formatError } from '../utils/helpers.js';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json(formatError('Access token required', 401));
  }

  const decoded = verifyJWT(token);
  if (!decoded) {
    return res.status(403).json(formatError('Invalid or expired token', 403));
  }

  req.user = decoded;
  next();
}

export function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json(formatError(message, statusCode));
}
