/**
 * @fileoverview Middleware de Rate Limiting para防止 ataques
 * @en Rate limiting middleware to prevent attacks
 */

import type { Request, Response, NextFunction } from 'express';

// Simple in-memory store for rate limiting (for production, use Redis)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

/**
 * Rate limit configuration
 */
const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // max requests per window
  maxRequestsAuth: 10, // max login attempts per window
  maxRequestsAPI: 50, // max API requests per window
};

/**
 * Clean up expired entries
 */
const cleanup = () => {
  const now = Date.now();
  for (const [key, value] of requestCounts.entries()) {
    if (now > value.resetTime) {
      requestCounts.delete(key);
    }
  }
};

// Run cleanup every 5 minutes
setInterval(cleanup, 5 * 60 * 1000);

/**
 * Get client identifier
 */
const getClientId = (req: Request): string => {
  return req.ip || req.socket.remoteAddress || 'unknown';
};

/**
 * Rate limiter middleware factory
 */
export const rateLimiter = (options?: { maxRequests?: number }) => {
  const maxRequests = options?.maxRequests || RATE_LIMIT_CONFIG.maxRequests;
  
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const clientId = getClientId(req);
    const now = Date.now();
    
    let clientData = requestCounts.get(clientId);
    
    // Reset if window expired
    if (!clientData || now > clientData.resetTime) {
      clientData = {
        count: 0,
        resetTime: now + RATE_LIMIT_CONFIG.windowMs,
      };
      requestCounts.set(clientId, clientData);
    }
    
    // Check limit
    if (clientData.count >= maxRequests) {
      res.status(429).json({
        error: 'Too Many Requests',
        message: 'Exceeded request limit. Please try again later.',
        retryAfter: Math.ceil((clientData.resetTime - now) / 1000),
      });
      return;
    }
    
    // Increment counter
    clientData.count++;
    
    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', maxRequests - clientData.count);
    res.setHeader('X-RateLimit-Reset', clientData.resetTime);
    
    next();
  };
};

/**
 * Strict rate limiter for authentication endpoints
 */
export const authRateLimiter = rateLimiter({ 
  maxRequests: RATE_LIMIT_CONFIG.maxRequestsAuth 
});

/**
 * API rate limiter
 */
export const apiRateLimiter = rateLimiter({ 
  maxRequests: RATE_LIMIT_CONFIG.maxRequestsAPI 
});

export default {
  rateLimiter,
  authRateLimiter,
  apiRateLimiter,
};