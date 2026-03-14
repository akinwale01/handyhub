import { LRUCache } from "lru-cache";

const rateLimit = new LRUCache<string, number>({
  max: 500,
  ttl: 1000 * 60, // 1 minute window
});

export function checkRateLimit(ip: string, limit = 10) {
  const current = rateLimit.get(ip) || 0;

  if (current >= limit) return false;

  rateLimit.set(ip, current + 1);
  return true;
}