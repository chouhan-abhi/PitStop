import { useQuery } from '@tanstack/react-query';
import { APP_CACHE_CONFIG } from '../../common/AppConfig';

const fetchDrivers = async ({ queryKey }) => {
  const [_, meeting_key, driver_number, position] = queryKey;
  let url = `https://api.openf1.org/v1/position`;
  const params = new URLSearchParams();

  if (meeting_key) {
    params.append('meeting_key', meeting_key);
  }
  if (driver_number) {
    params.append('driver_number', driver_number);
  }
  if (position) {
    params.append('position', position);
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

export function usePositions(meeting_key, driver_number, position, options = {}) {
  return useQuery({
    queryKey: ['drivers', meeting_key, driver_number, position],
    queryFn: fetchDrivers,
    enabled: options.enabled !== undefined ? options.enabled : Boolean(meeting_key),
    ...APP_CACHE_CONFIG,
    ...options,
  });
}