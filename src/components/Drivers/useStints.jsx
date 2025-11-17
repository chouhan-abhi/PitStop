import { useQuery } from '@tanstack/react-query';
import { APP_CACHE_CONFIG } from '../../common/AppConfig';

const fetchStints = async ({ queryKey }) => {
  const [_, sessionKey] = queryKey;
  let url = `https://api.openf1.org/v1/stints`;
  const params = new URLSearchParams();

  if (sessionKey) {
    params.append('session_key', sessionKey);
  }

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
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

