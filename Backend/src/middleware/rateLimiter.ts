import rateLimit from "express-rate-limit";

// Rate limiter for public enquiry submission: maximum 10 requests per 15 minutes per IP
export const enquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many enquiries submitted from this IP. Please wait a few minutes before trying again.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General public read limiter
export const publicApiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 120,
  message: {
    success: false,
    message: "Request limit exceeded. Please slow down.",
  },
});

