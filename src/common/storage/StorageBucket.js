// src/common/storage/StorageBucket.js

const DEFAULT_SCHEMA_VERSION = 1;

export class StorageBucket {
  constructor(driver, options) {
    const {
      rootKey = "pitstop:v2",
      subApp,
      source,
      type,
      schemaVersion = DEFAULT_SCHEMA_VERSION,
    } = options;

    this.driver = driver;
    this.rootKey = rootKey;
    this.subApp = subApp;
    this.source = source;
    this.type = type;
    this.schemaVersion = schemaVersion;
  }

  _recordKey(recordId) {
    return `${this.rootKey}:${this.subApp}:${this.source}:${recordId}`;
  }

  _indexKey() {
    return `${this.rootKey}:index:${this.subApp}`;
  }

  _readIndex() {
    const index = this.driver.get(this._indexKey());
    return Array.isArray(index) ? index : [];
  }

  _writeIndex(keys) {
    const uniq = Array.from(new Set(keys));
    this.driver.set(this._indexKey(), uniq);
    return uniq;
  }

  _addToIndex(key) {
    const index = this._readIndex();
    if (!index.includes(key)) {
      index.push(key);
      this._writeIndex(index);
    }
  }

  _removeFromIndex(key) {
    const index = this._readIndex();
    const next = index.filter((k) => k !== key);
    this._writeIndex(next);
  }

  _isValidEnvelope(envelope) {
    if (!envelope || typeof envelope !== "object") return false;
    if (!envelope.schemaVersion || envelope.schemaVersion !== this.schemaVersion) {
      return false;
    }
    if (!envelope.subApp || !envelope.source || !envelope.type) return false;
    if (!("payload" in envelope)) return false;
    return true;
  }

  _buildEnvelope(recordId, payload, ttlMs = null) {
    const now = Date.now();
    return {
      id: recordId,
      subApp: this.subApp,
      source: this.source,
      type: this.type,
      schemaVersion: this.schemaVersion,
      createdAt: now,
      updatedAt: now,
      ttlMs,
      payload,
    };
  }

  _touchEnvelope(envelope) {
    return {
      ...envelope,
      updatedAt: Date.now(),
    };
  }

  getEnvelope(recordId) {
    const key = this._recordKey(recordId);
    const envelope = this.driver.get(key);
    if (!this._isValidEnvelope(envelope)) {
      if (envelope) {
        this.driver.remove(key);
        this._removeFromIndex(key);
      }
      return null;
    }
    return envelope;
  }

  getRecord(recordId) {
    const envelope = this.getEnvelope(recordId);
    return envelope ? envelope.payload : null;
  }

  setRecord(recordId, payload, options = {}) {
    const { ttlMs = null } = options;
    const key = this._recordKey(recordId);
    const existing = this.getEnvelope(recordId);
    const envelope = existing
      ? { ...this._touchEnvelope(existing), payload, ttlMs }
      : this._buildEnvelope(recordId, payload, ttlMs);

    try {
      this.driver.set(key, envelope);
      this._addToIndex(key);
      return true;
    } catch (error) {
      if (error?.name === "QuotaExceededError" || error?.code === 22) {
        return this._evictAndRetry(key, envelope);
      }
      console.warn("StorageBucket.setRecord failed:", error);
      return false;
    }
  }

  removeRecord(recordId) {
    const key = this._recordKey(recordId);
    this.driver.remove(key);
    this._removeFromIndex(key);
  }

  listRecords() {
    const keys = this._readIndex();
    const records = [];

    keys.forEach((key) => {
      const envelope = this.driver.get(key);
      if (!this._isValidEnvelope(envelope)) {
        this.driver.remove(key);
        this._removeFromIndex(key);
        return;
      }
      records.push(envelope);
    });

    return records;
  }

  clearBucket() {
    const keys = this._readIndex();
    keys.forEach((key) => this.driver.remove(key));
    this.driver.remove(this._indexKey());
  }

  _evictAndRetry(key, envelope) {
    const maxAttempts = 5;
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const evicted = this._evictLeastRecentlyUpdated();
      if (!evicted) {
        break;
      }
      try {
        this.driver.set(key, envelope);
        this._addToIndex(key);
        return true;
      } catch (error) {
        if (error?.name !== "QuotaExceededError" && error?.code !== 22) {
          console.warn("StorageBucket.setRecord retry failed:", error);
          return false;
        }
      }
    }
    console.warn("StorageBucket.setRecord failed after eviction attempts.");
    return false;
  }

  _evictLeastRecentlyUpdated() {
    const keys = this._readIndex();
    if (keys.length === 0) return false;

    const entries = keys
      .map((key) => {
        const envelope = this.driver.get(key);
        if (!this._isValidEnvelope(envelope)) {
          return null;
        }
        return { key, updatedAt: envelope.updatedAt || 0 };
      })
      .filter(Boolean)
      .sort((a, b) => a.updatedAt - b.updatedAt);

    if (entries.length === 0) return false;

    const oldest = entries[0];
    this.driver.remove(oldest.key);
    this._removeFromIndex(oldest.key);
    return true;
  }
}

