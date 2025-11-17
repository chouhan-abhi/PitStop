import { useQuery } from '@tanstack/react-query';
import { APP_CACHE_CONFIG } from '../../common/AppConfig';

const fetchEvents = async ({ queryKey }) => {
  const [_, year, country_name] = queryKey;
  let url = `https://api.openf1.org/v1/meetings`;
  const params = new URLSearchParams();

  if (year) {
    params.append('year', year);
  }
  if (country_name) {
    params.append('country_name', country_name);
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

export function useEvents(year ='2025', country_name) {
  return useQuery({
    queryKey: ['events', year, country_name],
    queryFn: fetchEvents,
    ...APP_CACHE_CONFIG,
  });
}
