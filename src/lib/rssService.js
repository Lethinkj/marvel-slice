import { supabase } from './supabaseClient.js';

export const RSS_FEEDS = [
  // 1. Banking & RBI
  {
    name: 'RBI & Indian Banking',
    category: 'Banking & RBI',
    url: 'https://news.google.com/rss/search?q=Banking+RBI+Reserve+Bank+India&hl=en-IN&gl=IN&ceid=IN:en',
    importance: 'High',
  },
  {
    name: 'Global Banking & Central Banks',
    category: 'Banking & RBI',
    url: 'https://news.google.com/rss/search?q=Federal+Reserve+ECB+IMF+World+Bank+Central+Bank&hl=en-US&gl=US&ceid=US:en',
    importance: 'High',
  },
  // 2. Economy & Business
  {
    name: 'Indian Economy & Business',
    category: 'Economy & Business',
    url: 'https://news.google.com/rss/search?q=Economy+Finance+India+GDP+Inflation&hl=en-IN&gl=IN&ceid=IN:en',
    importance: 'High',
  },
  {
    name: 'Global Economy & International Trade',
    category: 'Economy & Business',
    url: 'https://news.google.com/rss/search?q=Global+Economy+Trade+Markets+Inflation+GDP&hl=en-US&gl=US&ceid=US:en',
    importance: 'High',
  },
  // 3. Government Schemes
  {
    name: 'Press Information Bureau (PIB India)',
    category: 'Government Schemes',
    url: 'https://news.google.com/rss/search?q=site:pib.gov.in&hl=en-IN&gl=IN&ceid=IN:en',
    importance: 'High',
  },
  {
    name: 'Indian Govt Schemes & Initiatives',
    category: 'Government Schemes',
    url: 'https://news.google.com/rss/search?q=Government+Schemes+Ministry+Policy+India&hl=en-IN&gl=IN&ceid=IN:en',
    importance: 'High',
  },
  {
    name: 'Global Development & International Initiatives',
    category: 'Government Schemes',
    url: 'https://news.google.com/rss/search?q=United+Nations+Global+Development+Policy+Scheme&hl=en-US&gl=US&ceid=US:en',
    importance: 'Medium',
  },
  // 4. National Affairs
  {
    name: 'Indian National Affairs',
    category: 'National Affairs',
    url: 'https://news.google.com/rss/search?q=National+News+India+Governance+Parliament&hl=en-IN&gl=IN&ceid=IN:en',
    importance: 'High',
  },
  // 5. International Affairs
  {
    name: 'India Foreign Relations & Summits',
    category: 'International Affairs',
    url: 'https://news.google.com/rss/search?q=India+Foreign+Policy+Bilateral+Summit&hl=en-IN&gl=IN&ceid=IN:en',
    importance: 'High',
  },
  {
    name: 'Global Geopolitics & World Affairs',
    category: 'International Affairs',
    url: 'https://news.google.com/rss/search?q=Global+Geopolitics+United+Nations+Diplomacy&hl=en-US&gl=US&ceid=US:en',
    importance: 'Medium',
  },
  // 6. Science & Defense
  {
    name: 'ISRO & Indian Defense',
    category: 'Science & Defense',
    url: 'https://news.google.com/rss/search?q=ISRO+DRDO+Defense+Military+India&hl=en-IN&gl=IN&ceid=IN:en',
    importance: 'High',
  },
  {
    name: 'Global Science, NASA & Defense Tech',
    category: 'Science & Defense',
    url: 'https://news.google.com/rss/search?q=NASA+Space+Technology+AI+Defense+Breakthrough&hl=en-US&gl=US&ceid=US:en',
    importance: 'Medium',
  },
  // 7. Sports & Awards
  {
    name: 'Indian Sports & National Honors',
    category: 'Sports & Awards',
    url: 'https://news.google.com/rss/search?q=Sports+Awards+Honors+India+Cricket&hl=en-IN&gl=IN&ceid=IN:en',
    importance: 'Medium',
  },
  {
    name: 'Global Sports & World Championships',
    category: 'Sports & Awards',
    url: 'https://news.google.com/rss/search?q=Olympics+World+Cup+Grand+Slam+Tennis+Athletics&hl=en-US&gl=US&ceid=US:en',
    importance: 'Medium',
  },
];

function decodeHtmlEntities(str = '') {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/<[^>]*>/g, '')
    .trim();
}

function extractImageUrl(description = '', enclosureUrl = '', mediaUrl = '') {
  if (enclosureUrl) return enclosureUrl;
  if (mediaUrl) return mediaUrl;
  const match = description.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : null;
}

export function formatDetailedContent(title, description, category, source, dateStr) {
  const headline = (title || '').replace(/\s*-\s*[^-]+$/, '').trim();
  const cleanSnippet = decodeHtmlEntities(description || '');

  if (cleanSnippet.length > 120 && !cleanSnippet.includes(headline)) {
    return cleanSnippet;
  }

  const dateFormatted = dateStr
    ? new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Recent';

  return `Executive Summary (${dateFormatted}):
${headline}. Reported by ${source || 'Official News Source'}, this update represents a key current affairs development under ${category}.

Detailed Background & Context:
Nodal authorities and official representatives have highlighted key developments regarding this announcement. Key aspects to track for competitive examinations include policy scope, regulatory frameworks, operational timelines, and financial or institutional benchmarks associated with ${headline}.

Exam Revision Highlights:
• Topic Category: ${category}
• Primary Source: ${source || 'Official Media'}
• Exam Relevance: High priority for IBPS PO, SBI PO, RBI Grade B, SSC, and Railway Mains examinations.`;
}

function parseRssXml(xmlText, category, defaultImportance, feedSource) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemXml = match[1];

    const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/i);
    const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/i);
    const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
    const descMatch = itemXml.match(/<description>([\s\S]*?)<\/description>/i);
    const sourceMatch = itemXml.match(/<source[^>]*>([\s\S]*?)<\/source>/i);
    const enclosureMatch = itemXml.match(/<enclosure[^>]+url=["']([^"']+)["']/i);
    const mediaMatch = itemXml.match(/<media:content[^>]+url=["']([^"']+)["']/i);

    const rawTitle = titleMatch ? titleMatch[1] : '';
    const cleanTitle = decodeHtmlEntities(rawTitle);
    const link = linkMatch ? linkMatch[1].trim() : '';
    const pubDateStr = pubDateMatch ? pubDateMatch[1].trim() : new Date().toISOString();
    const rawDesc = descMatch ? descMatch[1] : '';
    const cleanDesc = decodeHtmlEntities(rawDesc);
    const sourceName = sourceMatch ? decodeHtmlEntities(sourceMatch[1]) : feedSource;
    const imageUrl = extractImageUrl(
      rawDesc,
      enclosureMatch ? enclosureMatch[1] : '',
      mediaMatch ? mediaMatch[1] : ''
    );

    if (cleanTitle && link) {
      let publishedAt = new Date().toISOString();
      try {
        const parsedDate = new Date(pubDateStr);
        if (!isNaN(parsedDate.getTime())) {
          publishedAt = parsedDate.toISOString();
        }
      } catch {
        // Fallback to now
      }

      const summary = cleanTitle;
      const content = formatDetailedContent(cleanTitle, cleanDesc, category, sourceName, publishedAt);

      items.push({
        title: cleanTitle,
        summary,
        content,
        category,
        source: sourceName || 'Official News Agency',
        source_url: link,
        image_url: imageUrl || '/images/banking/5.png',
        published_at: publishedAt,
        importance: defaultImportance,
        is_published: true,
      });
    }
  }

  return items;
}

export async function fetchRssFeed(feed) {
  try {
    const response = await fetch(feed.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      console.warn(`[RSS] Failed to fetch feed ${feed.name}: ${response.status}`);
      return [];
    }

    const xmlText = await response.text();
    return parseRssXml(xmlText, feed.category, feed.importance, feed.name);
  } catch (err) {
    console.error(`[RSS] Error fetching feed ${feed.name}:`, err.message);
    return [];
  }
}

export async function fetchAndStoreCurrentAffairs() {
  console.log('[RSS] Starting automated Current Affairs fetch (India + International feeds)...');
  let totalFetched = 0;
  let totalInserted = 0;
  const allParsedItems = [];

  for (const feed of RSS_FEEDS) {
    const items = await fetchRssFeed(feed);
    totalFetched += items.length;
    allParsedItems.push(...items);
  }

  if (allParsedItems.length === 0) {
    console.log('[RSS] No items fetched.');
    return { fetched: 0, inserted: 0, items: [] };
  }

  // Deduplicate items by source_url in memory
  const uniqueItemsMap = new Map();
  for (const item of allParsedItems) {
    if (!uniqueItemsMap.has(item.source_url)) {
      uniqueItemsMap.set(item.source_url, item);
    }
  }
  const uniqueItems = Array.from(uniqueItemsMap.values());

  try {
    // Check existing URLs in Supabase current_affairs
    const { data: existing, error: selectErr } = await supabase
      .from('current_affairs')
      .select('source_url');

    if (selectErr) {
      console.warn('[RSS] Supabase query notice (table may need migration):', selectErr.message);
      return { fetched: totalFetched, inserted: 0, items: uniqueItems };
    }

    const existingUrls = new Set((existing || []).map((row) => row.source_url));
    const newItems = uniqueItems.filter((item) => !existingUrls.has(item.source_url));

    if (newItems.length > 0) {
      const { data: inserted, error: insertErr } = await supabase
        .from('current_affairs')
        .upsert(newItems, { onConflict: 'source_url', ignoreDuplicates: true })
        .select('id');

      if (insertErr) {
        console.error('[RSS] Supabase insertion error:', insertErr.message);
      } else {
        totalInserted = inserted ? inserted.length : 0;
        console.log(`[RSS] Successfully processed ${newItems.length} articles (${totalInserted} new inserted).`);
      }
    } else {
      console.log('[RSS] All fetched articles are already up to date.');
    }
  } catch (err) {
    console.error('[RSS] Unexpected DB processing error:', err.message);
  }

  return { fetched: totalFetched, inserted: totalInserted, items: uniqueItems };
}
