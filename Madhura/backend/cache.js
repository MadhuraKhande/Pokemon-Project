// Simple LRU Cache implementation with TTL

class LRUCache {
  constructor(maxSize = 100, ttl = 10 * 60 * 1000) {
    this.maxSize = maxSize;
    this.ttl = ttl;
    this.cache = new Map();
  }

 
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if the cached item has expired based on TTL
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    // Move accessed item to end of Map to mark it as recently used
    this.cache.delete(key);
    this.cache.set(key, item);

    return item.value;
  }

 
  set(key, value) {
 
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // Remove oldest entry if we've hit the cache size limit
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

   
    this.cache.set(key, {
      value,
      expiry: Date.now() + this.ttl
    });
  }

 
  has(key) {
    return this.get(key) !== null;
  }

 
  size() {
    return this.cache.size;
  }


  clear() {
    this.cache.clear();
  }
}

module.exports = LRUCache;
