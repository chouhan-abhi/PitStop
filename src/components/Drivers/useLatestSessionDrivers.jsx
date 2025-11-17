import { useQuery } from '@tanstack/react-query';
import { APP_CACHE_CONFIG } from '../../common/AppConfig';

const fetchLatestSessionDrivers = async ({ queryKey }) => {
  const [_, meetingKey, sessionKey] = queryKey;
  let url = `https://api.openf1.org/v1/drivers`;
  const params = new URLSearchParams();

  if (meetingKey) {
    params.append('meeting_key', meetingKey);
  }
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

export function useLatestSessionDrivers(meetingKey, sessionKey = null, options = {}) {
  return useQuery({
    queryKey: ['latestSessionDrivers', meetingKey, sessionKey],
    queryFn: fetchLatestSessionDrivers,
    enabled: options.enabled !== undefined ? options.enabled : Boolean(meetingKey),
    ...APP_CACHE_CONFIG,
    ...options,
  });
}
