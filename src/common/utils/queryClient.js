import { QueryClient } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import LocalStorageManager from './LocalStorageManager';

const localStorageManager = new LocalStorageManager('f1pitstop-query');

// Create a custom storage adapter for React Query
const queryStorage = {
  getItem: (key) => {
    try {
      const value = localStorageManager.get(key);
      return value ? JSON.stringify(value) : null;
    } catch (error) {
      console.warn('Failed to get item from query storage:', error);
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      localStorageManager.set(key, JSON.parse(value));
    } catch (error) {
      console.warn('Failed to set item in query storage:', error);
    }
  },
  removeItem: (key) => {
    try {
      localStorageManager.remove(key);
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
      gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days (formerly cacheTime)
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
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  });
} catch (error) {
  console.warn('Failed to persist query client:', error);
}

export default queryClient;

