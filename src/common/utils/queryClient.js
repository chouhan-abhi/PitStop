import { QueryClient } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { persistQueryClient } from '@tanstack/react-query-persist-client';

import { getActiveSubApp, getBucket } from '../storage';

// Create a custom storage adapter for React Query
const queryStorage = {
  getItem: (key) => {
    try {
      const bucket = getBucket(getActiveSubApp(), 'react-query', 'api');
      const value = bucket.getRecord(key);
      return value ? JSON.stringify(value) : null;
    } catch (error) {
      console.warn('Failed to get item from query storage:', error);
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      const bucket = getBucket(getActiveSubApp(), 'react-query', 'api');
      bucket.setRecord(key, JSON.parse(value));
    } catch (error) {
      console.warn('Failed to set item in query storage:', error);
    }
  },
  removeItem: (key) => {
    try {
      const bucket = getBucket(getActiveSubApp(), 'react-query', 'api');
      bucket.removeRecord(key);
    } catch (error) {
      console.warn('Failed to remove item from query storage:', error);
    }
  },
};

// Create persister
const persister = createSyncStoragePersister({
  storage: queryStorage,
  serialize: JSON.stringify,
  deserialize: JSON.parse,
});

// Create QueryClient with optimized defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60 * 24, // 24 hours
      gcTime: 1000 * 60 * 60 * 24, // 1 day (formerly cacheTime)
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// Persist the query client
try {
  persistQueryClient({
    queryClient,
    persister,
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  });
} catch (error) {
  console.warn('Failed to persist query client:', error);
}

export default queryClient;
