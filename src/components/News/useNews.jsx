import { useQuery } from '@tanstack/react-query';

const fetchNews = async () => {

  const url = `https://hn.algolia.com/api/v1/search?query=Formula1`;

  console.log('Fetching news from:', url);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch news');
  }

  const data = await res.json();

  return data;
};

export function useNews(timeframe = 'week', limit = 15) {
  return useQuery({
    queryKey: ['news', timeframe, limit],
    queryFn: fetchNews,
    // staleTime: 1000 * 60 * 30,
    // gcTime: 1000 * 60 * 60 * 2,
    // refetchOnWindowFocus: false,
  });
}
