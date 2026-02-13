import { useQuery } from '@tanstack/react-query';

import { APP_CACHE_CONFIG } from '../../common/AppConfig';

const fetchStints = async () => {
  return [];
};

export function useStints(sessionKey, options = {}) {
  return useQuery({
    queryKey: ['stints', sessionKey],
    queryFn: fetchStints,
    enabled: options.enabled !== undefined ? options.enabled : Boolean(sessionKey),
    ...APP_CACHE_CONFIG,
    ...options,
  });
}
