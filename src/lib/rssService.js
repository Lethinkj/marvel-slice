import { supabase } from './supabaseClient.js';

export const RSS_FEEDS = [
  {
    name: 'Banking & RBI',
    category: 'Banking & RBI',
    url: 'https://news.google.com/rss/search?q=Banking+RBI+Reserve+Bank+India&hl=en-IN&gl=IN&ceid=IN:en',
    importance: 'High',
  },
  {
    name: 'Economy & Finance',
    category: 'Economy & Business',
    url: 'https://news.google.com/rss/search?q=Economy+Finance+India+GDP+Inflation&hl=en-IN&gl=IN&ceid=IN:en',
    importance: 'High',
  },
  {
    name: 'Government Schemes',
    category: 'Government Schemes',
    url: 'https://news.google.com/rss/search?q=Government+Schemes+Policy+Ministry+India&hl=en-IN&gl=IN&ceid=IN:en',
    importance: 'High',
  },
  {
    name: 'National Affairs',
    category: 'National Affairs',
    url: 'https://news.google.com/rss/search?q=National+News+Current+Affairs+India&hl=en-IN&gl=IN&ceid=IN:en',
    importance: 'Medium',
  },
  {
    name: 'International Affairs',
    category: 'International Affairs',
    url: 'https://news.google.com/rss/search?q=International+Relations+Bilateral+Summit+India&hl=en-IN&gl=IN&ceid=IN:en',
    importance: 'Medium',
  },
  {
    name: 'Science & Defense',
    category: 'Science & Defense',
    url: 'https://news.google.com/rss/search?q=ISRO+Defense+Military+Exercise+Technology+India&hl=en-IN&gl=IN&ceid=IN:en',
    importance: 'Medium',
  },
  {
    name: 'Sports & Awards',
    category: 'Sports & Awards',
    url: 'https://news.google.com/rss/search?q=Sports+Awards+Honors+India&hl=en-IN&gl=IN&ceid=IN:en',
    importance: 'Medium',
  },
  {
    name: 'Press Information Bureau (PIB)',
    category: 'Government Schemes',
    url: 'https://news.google.com/rss/search?q=site:pib.gov.in&hl=en-IN&gl=IN&ceid=IN:en',
    importance: 'High',
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

      // Generate AI-style bulleted summary for exam revision
      const summary = cleanDesc.length > 280 ? cleanDesc.slice(0, 277) + '...' : cleanDesc;
      const content = `${cleanDesc}\n\n• Key Takeaway for Competitive Exams: Track policy impact, responsible ministry/organization, and relevant economic indicators linked with this update.`;

      items.push({
        title: cleanTitle,
        summary: summary || cleanTitle,
        content,
        category,
        source: sourceName || 'Current Affairs News',
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
  console.log('[RSS] Starting automated Current Affairs fetch...');
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
        .insert(newItems)
        .select('id');

      if (insertErr) {
        console.error('[RSS] Supabase insertion error:', insertErr.message);
      } else {
        totalInserted = inserted ? inserted.length : newItems.length;
        console.log(`[RSS] Successfully inserted ${totalInserted} new Current Affairs articles.`);
      }
    } else {
      console.log('[RSS] All fetched articles are already up to date.');
    }
  } catch (err) {
    console.error('[RSS] Unexpected DB processing error:', err.message);
  }

  return { fetched: totalFetched, inserted: totalInserted, items: uniqueItems };
}
