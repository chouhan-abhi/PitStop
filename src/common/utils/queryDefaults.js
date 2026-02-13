export const QUERY_DEFAULTS = {
  staleTime: 1000 * 60 * 15,
  gcTime: 1000 * 60 * 60 * 12,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  refetchOnReconnect: false,
  retry: 1,
};

export const QUERY_ARCHIVE_DEFAULTS = {
  ...QUERY_DEFAULTS,
  staleTime: 1000 * 60 * 60 * 24,
  gcTime: 1000 * 60 * 60 * 24,
};

export const QUERY_LIVE_DEFAULTS = {
  ...QUERY_DEFAULTS,
  staleTime: 1000 * 60 * 2,
  gcTime: 1000 * 60 * 30,
  refetchOnReconnect: true,
};
