// src/common/utils/LocalStorageManager.js
import LZString from "lz-string";

export default class LocalStorageManager {
  constructor(namespace = "f1pitstop", defaultTTL = 1000 * 60 * 60 * 24) {
    // defaultTTL: 1 day in milliseconds
    this.ns = namespace;
    this.defaultTTL = defaultTTL;
  }

  _key(key) {
    return `${this.ns}:${key}`;
  }

  _timestampKey(key) {
    return `${this.ns}:${key}:timestamp`;
  }

  get(key) {
    try {
      const value = localStorage.getItem(this._key(key));
      if (!value) return null;

      // Check if cache has expired (only if timestamp exists)
      const timestampKey = this._timestampKey(key);
      const timestamp = localStorage.getItem(timestampKey);
      
      if (timestamp && timestamp !== "never") {
        const age = Date.now() - Number.parseInt(timestamp, 10);
        if (age > this.defaultTTL) {
          // Cache expired, remove it
          this.remove(key);
          return null;
        }
      }

      const decompressed = LZString.decompress(value);
      return JSON.parse(decompressed || value);
    } catch (err) {
      console.warn("LocalStorageManager: Failed to get item", err);
      return null;
    }
  }

  set(key, value, ttl = null) {
    try {
      const compressed = LZString.compress(JSON.stringify(value));
      localStorage.setItem(this._key(key), compressed);
      
      // Store timestamp with TTL
      // If ttl is Infinity, mark as "never" expire (for user preferences)
      // If ttl is null, use default TTL (1 day for cache data)
      // Otherwise use the provided TTL
      if (ttl === Number.POSITIVE_INFINITY) {
        localStorage.setItem(this._timestampKey(key), "never");
      } else {
        localStorage.setItem(this._timestampKey(key), Date.now().toString());
      }
    } catch (err) {
      console.error("LocalStorageManager: Failed to set item", err);

      // 🔧 Fallback: Try clearing older cache if quota exceeded
      if (err.name === "QuotaExceededError" || err.code === 22) {
        console.warn("🧹 Storage full, clearing old cache...");
        this.clear();
        try {
          const compressed = LZString.compress(JSON.stringify(value));
          localStorage.setItem(this._key(key), compressed);
          if (ttl === Number.POSITIVE_INFINITY) {
            localStorage.setItem(this._timestampKey(key), "never");
          } else {
            localStorage.setItem(this._timestampKey(key), Date.now().toString());
          }
        } catch (retryErr) {
          console.error("❌ Retry failed to set item after clearing", retryErr);
        }
      }
    }
  }

  remove(key) {
    try {
      localStorage.removeItem(this._key(key));
      localStorage.removeItem(this._timestampKey(key));
    } catch (err) {
      console.warn("LocalStorageManager: Failed to remove item", err);
    }
  }

  clear() {
    try {
      const keys = Object.keys(localStorage)
        .filter((k) => k.startsWith(`${this.ns}:`));
      for (const k of keys) {
        localStorage.removeItem(k);
      }
    } catch (err) {
      console.warn("LocalStorageManager: Failed to clear namespace", err);
    }
  }

  // Clear expired cache entries
  clearExpired() {
    try {
      const keys = Object.keys(localStorage)
        .filter((k) => k.startsWith(`${this.ns}:`) && k.endsWith(':timestamp'));
      
      for (const timestampKey of keys) {
        const timestamp = localStorage.getItem(timestampKey);
        if (timestamp && timestamp !== "never") {
          const age = Date.now() - Number.parseInt(timestamp, 10);
          if (age > this.defaultTTL) {
            // Extract the original key
            const key = timestampKey.replace(`${this.ns}:`, '').replace(':timestamp', '');
            this.remove(key);
          }
        }
      }
    } catch (err) {
      console.warn("LocalStorageManager: Failed to clear expired cache", err);
    }
  }
}
