import { QueryClient } from "@tanstack/react-query";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { persistQueryClient } from "@tanstack/react-query-persist-client";

import { getActiveSubApp, getBucket } from "../storage";
import { QUERY_DEFAULTS } from "./queryDefaults";

const queryStorage = {
  getItem: (key) => {
    try {
      const bucket = getBucket(getActiveSubApp(), "react-query", "api");
      const value = bucket.getRecord(key);
      return value ? JSON.stringify(value) : null;
    } catch (error) {
      console.warn("Failed to get item from query storage:", error);
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      const bucket = getBucket(getActiveSubApp(), "react-query", "api");
      bucket.setRecord(key, JSON.parse(value));
    } catch (error) {
      console.warn("Failed to set item in query storage:", error);
    }
  },
  removeItem: (key) => {
    try {
      const bucket = getBucket(getActiveSubApp(), "react-query", "api");
      bucket.removeRecord(key);
    } catch (error) {
      console.warn("Failed to remove item from query storage:", error);
    }
  },
};

const persister = createSyncStoragePersister({
  storage: queryStorage,
  serialize: JSON.stringify,
  deserialize: JSON.parse,
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      ...QUERY_DEFAULTS,
    },
  },
});

try {
  persistQueryClient({
    queryClient,
    persister,
    maxAge: 1000 * 60 * 60 * 24,
  });
} catch (error) {
  console.warn("Failed to persist query client:", error);
}

export default queryClient;
