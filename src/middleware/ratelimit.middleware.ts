import rateLimit from "express-rate-limit";

import config from "@/config";

const authLimiter = rateLimit({
  windowMs: config.AuthWindowMs,
  max: config.AuthMaxRequests,
  message: "Auth Rate Limit: Please try again in an hour",
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: config.APIWindowMs,
  max: config.APIMaxRequests,
  message: "API Rate Limit: Please try again in an hour",
  standardHeaders: true,
  legacyHeaders: false,
});

export default {
  authLimiter,
  apiLimiter,
};
