export const AppConfig = {
  name: "F1 QuickStop",
  description: "A dashboard for F1 sports data",
  version: "1.0.1",
};

// Legacy export for backward compatibility - now handled by queryClient.js
export const APP_CACHE_CONFIG = {
  staleTime: 1000 * 60 * 60 * 24, // 24 hours
  gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  refetchOnReconnect: false,
};