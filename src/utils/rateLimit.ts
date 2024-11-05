export class RateLimiter {
  private requests: Map<string, number[]>;
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 60) {
    this.requests = new Map();
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  canMakeRequest(key: string): boolean {
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];
    
    // Remove timestamps outside the window
    const validTimestamps = timestamps.filter(
      timestamp => now - timestamp < this.windowMs
    );
    
    if (validTimestamps.length >= this.maxRequests) {
      return false;
    }
    
    validTimestamps.push(now);
    this.requests.set(key, validTimestamps);
    return true;
  }
}