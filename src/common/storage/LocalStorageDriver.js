// src/common/storage/LocalStorageDriver.js

import LZString from "lz-string";
import { StorageDriver } from "./StorageDriver";

export class LocalStorageDriver extends StorageDriver {
  get(key) {
    try {
      const value = localStorage.getItem(key);
      if (!value) return null;
      const decompressed = LZString.decompress(value);
      return JSON.parse(decompressed || value);
    } catch (error) {
      console.warn("LocalStorageDriver.get failed:", error);
      return null;
    }
  }

  set(key, value) {
    try {
      const compressed = LZString.compress(JSON.stringify(value));
      localStorage.setItem(key, compressed);
      return true;
    } catch (error) {
      if (error?.name === "QuotaExceededError" || error?.code === 22) {
        throw error;
      }
      console.warn("LocalStorageDriver.set failed:", error);
      return false;
    }
  }

  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn("LocalStorageDriver.remove failed:", error);
    }
  }

  list(prefix) {
    try {
      return Object.keys(localStorage).filter((k) => k.startsWith(prefix));
    } catch (error) {
      console.warn("LocalStorageDriver.list failed:", error);
      return [];
    }
  }

  clear(prefix) {
    try {
      const keys = this.list(prefix);
      keys.forEach((k) => localStorage.removeItem(k));
    } catch (error) {
      console.warn("LocalStorageDriver.clear failed:", error);
    }
  }
}

