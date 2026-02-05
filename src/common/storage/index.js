// src/common/storage/index.js

import { LocalStorageDriver } from "./LocalStorageDriver";
import { StorageBucket } from "./StorageBucket";
import LocalStorageManager from "../utils/LocalStorageManager";
import { AppConfig } from "../AppConfig";

export const STORAGE_ROOT = "pitstop:v2";
export const STORAGE_SCHEMA_VERSION = 1;
export const STORAGE_META_KEY = `${STORAGE_ROOT}:meta`;

const driver = new LocalStorageDriver();

let activeSubApp = "dashboard";

export const setActiveSubApp = (subApp) => {
  if (subApp && typeof subApp === "string") {
    activeSubApp = subApp;
  }
};

export const getActiveSubApp = () => activeSubApp;

export const getBucket = (subApp, source, type) =>
  new StorageBucket(driver, {
    rootKey: STORAGE_ROOT,
    subApp,
    source,
    type,
    schemaVersion: STORAGE_SCHEMA_VERSION,
  });

const normalizeLegacyPrefsKey = (key) => {
  if (key === "theme") return "theme";
  if (key === "seasonYear") return "seasonYear";
  return `legacy:${key}`;
};

export const runStorageMigration = () => {
  const meta = driver.get(STORAGE_META_KEY);
  if (meta?.schemaVersion === STORAGE_SCHEMA_VERSION && meta?.migrated) {
    return;
  }

  const legacyPrefs = new LocalStorageManager("f1pitstop");
  const legacyQuery = new LocalStorageManager("f1pitstop-query");

  const prefsBucket = getBucket("app", "prefs", "prefs");
  const queryBucket = getBucket("dashboard", "react-query", "api");

  Object.keys(localStorage)
    .filter((key) => key.startsWith("f1pitstop:") && !key.endsWith(":timestamp"))
    .forEach((key) => {
      const legacyKey = key.replace("f1pitstop:", "");
      const value = legacyPrefs.get(legacyKey);
      if (value === null || value === undefined) return;
      prefsBucket.setRecord(normalizeLegacyPrefsKey(legacyKey), value);
    });

  Object.keys(localStorage)
    .filter((key) => key.startsWith("f1pitstop-query:") && !key.endsWith(":timestamp"))
    .forEach((key) => {
      const legacyKey = key.replace("f1pitstop-query:", "");
      const value = legacyQuery.get(legacyKey);
      if (value === null || value === undefined) return;
      queryBucket.setRecord(legacyKey, value);
    });

  driver.set(STORAGE_META_KEY, {
    schemaVersion: STORAGE_SCHEMA_VERSION,
    migrated: true,
    appVersion: AppConfig?.version,
    migratedAt: Date.now(),
  });
};

