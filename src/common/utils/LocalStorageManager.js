// src/common/utils/LocalStorageManager.js
import LZString from "lz-string";

export default class LocalStorageManager {
  constructor(namespace = "f1pitstop") {
    this.ns = namespace;
  }

  _key(key) {
    return `${this.ns}:${key}`;
  }

  get(key) {
    try {
      const value = localStorage.getItem(this._key(key));
      if (!value) return null;

      const decompressed = LZString.decompress(value);
      return JSON.parse(decompressed || value);
    } catch (err) {
      console.warn("LocalStorageManager: Failed to get item", err);
      return null;
    }
  }

  set(key, value) {
    try {
      const compressed = LZString.compress(JSON.stringify(value));
      localStorage.setItem(this._key(key), compressed);
    } catch (err) {
      console.error("LocalStorageManager: Failed to set item", err);

      // 🔧 Fallback: Try clearing older cache if quota exceeded
      if (err.name === "QuotaExceededError" || err.code === 22) {
        console.warn("🧹 Storage full, clearing old cache...");
        this.clear();
        try {
          const compressed = LZString.compress(JSON.stringify(value));
          localStorage.setItem(this._key(key), compressed);
        } catch (retryErr) {
          console.error("❌ Retry failed to set item after clearing", retryErr);
        }
      }
    }
  }

  remove(key) {
    try {
      localStorage.removeItem(this._key(key));
    } catch (err) {
      console.warn("LocalStorageManager: Failed to remove item", err);
    }
  }

  clear() {
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith(`${this.ns}:`))
        .forEach((k) => localStorage.removeItem(k));
    } catch (err) {
      console.warn("LocalStorageManager: Failed to clear namespace", err);
    }
  }
}
