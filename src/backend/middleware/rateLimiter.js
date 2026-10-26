import rateLimit from "express-rate-limit";

// Global Rate Limiter (100 requests per 15 mins)
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    message:
      "Too many requests from this IP, please try again after 15 minutes",
  },
  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict Auth Rate Limiter for Login/Register (10 attempts per 15 mins)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    message:
      "Too many login/registration attempts from this IP. Please try again after 15 minutes.",
  },
  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false,
});
