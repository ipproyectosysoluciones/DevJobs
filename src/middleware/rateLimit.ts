/**
 * @fileoverview Middleware de Rate Limiting para防止 ataques
 * @en Rate limiting middleware to prevent attacks
 */

import rateLimit from 'express-rate-limit';

/**
 * Rate limit configuration | Configuración de rate limit
 */
const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // max requests per window
  maxRequestsAuth: 10, // max login attempts per window
  maxRequestsAPI: 50, // max API requests per window
};

/**
 * Strict rate limiter for authentication endpoints
 * @description Limita intentos de login/registro para prevenir brute force
 * @en Limits login/register attempts to prevent brute force attacks
 */
export const authRateLimiter = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.windowMs,
  max: RATE_LIMIT_CONFIG.maxRequestsAuth,
  message: {
    error: 'Too Many Requests',
    message: 'Exceeded login attempts. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Exceeded login attempts. Please try again later.',
    });
  },
});

/**
 * API rate limiter
 * @description Limita requests a endpoints API
 * @en Limits requests to API endpoints
 */
export const apiRateLimiter = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.windowMs,
  max: RATE_LIMIT_CONFIG.maxRequestsAPI,
  message: {
    error: 'Too Many Requests',
    message: 'Exceeded API request limit. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * General rate limiter
 * @description Rate limit general para todas las rutas
 * @en General rate limiter for all routes
 */
export const generalRateLimiter = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.windowMs,
  max: RATE_LIMIT_CONFIG.maxRequests,
  message: {
    error: 'Too Many Requests',
    message: 'Exceeded request limit. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export default {
  authRateLimiter,
  apiRateLimiter,
  generalRateLimiter,
};