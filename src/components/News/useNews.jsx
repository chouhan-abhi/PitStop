import { useQuery } from '@tanstack/react-query';

const REDDIT_API_URL = 'https://www.reddit.com/r/formula1/top.json?t=week';

const fetchNews = async ({ queryKey }) => {
  const [, timeframe, limit] = queryKey;
  
  const url = `${REDDIT_API_URL}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch news');
  }
  
  const data = await response.json();
  
  const posts = data?.data?.children
    ?.filter(post => !post.data.stickied)
    ?.sort((a, b) => b.data.score - a.data.score) || [];

  return { posts };
};

export function useNews(timeframe = 'week', limit = 15) {
  return useQuery({
    queryKey: ['news', timeframe, limit],
    queryFn: fetchNews,
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60 * 2,
    retry: 2,
  });
}
