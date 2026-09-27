import { WebSource } from '../types';

export interface SearchResponse {
  ok: boolean;
  query: string;
  results: WebSource[];
  timestamp: string;
  source: 'duckduckgo-crawl' | 'duckduckgo-instant' | 'fallback';
}

/**
 * Executes a real-time web search for current events, facts, or news
 * using DuckDuckGo with fallback mechanisms.
 */
export async function executeWebSearch(query: string): Promise<SearchResponse> {
  const cleanQuery = (query || '').trim();
  if (!cleanQuery) {
    return {
      ok: false,
      query: '',
      results: [],
      timestamp: new Date().toISOString(),
      source: 'fallback',
    };
  }

  // 1. Try server-side enhanced DuckDuckGo crawler endpoint
  try {
    const res = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: cleanQuery }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.ok && Array.isArray(data.results) && data.results.length > 0) {
        return {
          ok: true,
          query: cleanQuery,
          results: data.results,
          timestamp: data.timestamp || new Date().toISOString(),
          source: 'duckduckgo-crawl',
        };
      }
    }
  } catch (err) {
    console.warn('Backend search API failed, attempting direct fallback...', err);
  }

  // 2. Direct client-side DuckDuckGo Instant Answer API fallback
  try {
    const directUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(cleanQuery)}&format=json&no_html=1&skip_disambig=1`;
    const directRes = await fetch(directUrl);
    if (directRes.ok) {
      const data = await directRes.json();
      const results: WebSource[] = [];

      if (data.Abstract && data.AbstractURL) {
        results.push({
          title: data.Heading || cleanQuery,
          url: data.AbstractURL,
          snippet: data.Abstract,
        });
      }

      if (Array.isArray(data.RelatedTopics)) {
        for (const topic of data.RelatedTopics.slice(0, 3)) {
          if (topic.Text && topic.FirstURL) {
            results.push({
              title: topic.Text.split(' - ')[0] || cleanQuery,
              url: topic.FirstURL,
              snippet: topic.Text,
            });
          }
        }
      }

      if (results.length > 0) {
        return {
          ok: true,
          query: cleanQuery,
          results,
          timestamp: new Date().toISOString(),
          source: 'duckduckgo-instant',
        };
      }
    }
  } catch (err) {
    console.warn('Client-side DuckDuckGo fallback failed:', err);
  }

  return {
    ok: false,
    query: cleanQuery,
    results: [],
    timestamp: new Date().toISOString(),
    source: 'fallback',
  };
}
