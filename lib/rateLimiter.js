
const rateLimit = new Map();

export function rateLimiter(identifier, limit = 10, windowMs = 60000) {
  const now = Date.now();
  const userLimit = rateLimit.get(identifier) || { count: 0, resetTime: now + windowMs };

  if (now > userLimit.resetTime) {
    userLimit.count = 0;
    userLimit.resetTime = now + windowMs;
  }

  userLimit.count++;
  rateLimit.set(identifier, userLimit);

  return {
    allowed: userLimit.count <= limit,
    remaining: Math.max(0, limit - userLimit.count),
    resetTime: userLimit.resetTime,
  };
}