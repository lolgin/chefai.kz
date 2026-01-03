
export interface DiscoveredStream {
  name: string;
  url: string;
  tags: string;
  favicon: string;
  bitrate?: number;
  codec?: string;
  country?: string;
  language?: string;
  lastCheck?: string;
  ping?: number;
  tested?: boolean;
}

const API_MIRRORS = [
  'all.api.radio-browser.info',
  'de1.api.radio-browser.info',
  'at1.api.radio-browser.info',
  'nl1.api.radio-browser.info'
];

let mirrorIndex = 0;

const getUrl = (path: string) => `https://${API_MIRRORS[mirrorIndex]}/json${path}`;

const rotateMirror = () => {
  mirrorIndex = (mirrorIndex + 1) % API_MIRRORS.length;
};

const normalizeSource = (url: string): string => {
  try {
    const parsed = new URL(url);
    return parsed.host + parsed.pathname.replace(/\/$/, "");
  } catch {
    return url.toLowerCase().trim().replace(/\/$/, "");
  }
};

export const searchStreams = async (query: string): Promise<DiscoveredStream[]> => {
  if (!query || query.trim().length < 2) return [];
  
  const attemptSearch = async (retries = 3): Promise<DiscoveredStream[]> => {
    try {
      const [nameRes, tagRes] = await Promise.all([
        fetch(getUrl(`/stations/search?name=${encodeURIComponent(query)}&limit=80&hidebroken=true&order=clickcount&reverse=true`)),
        fetch(getUrl(`/stations/bytag/${encodeURIComponent(query)}?limit=80&hidebroken=true&order=clickcount&reverse=true`))
      ]);
      
      if (!nameRes.ok) throw new Error('Mirror failure');
      
      const nameData = await nameRes.json();
      const tagData = tagRes.ok ? await tagRes.json() : [];

      const rawPool = [...nameData, ...tagData];
      
      const uniqueSources = new Set<string>();
      const uniqueNames = new Set<string>();
      const deduplicated: DiscoveredStream[] = [];

      for (const s of rawPool) {
        const streamUrl = (s.url_resolved || s.url || '').trim();
        const sourceId = normalizeSource(streamUrl);
        const streamName = (s.name || '').trim().toLowerCase();

        if (sourceId && !uniqueSources.has(sourceId) && !uniqueNames.has(streamName)) {
          uniqueSources.add(sourceId);
          uniqueNames.add(streamName);
          
          deduplicated.push({
            name: s.name || 'Unknown Signal',
            url: s.url_resolved || s.url,
            tags: s.tags || 'UNDEFINED',
            favicon: s.favicon || '',
            bitrate: s.bitrate,
            codec: s.codec,
            country: s.countrycode || s.country,
            language: s.language,
            lastCheck: s.lastchecktime,
            tested: false,
            ping: 0
          });
        }

        if (deduplicated.length >= 80) break;
      }

      return deduplicated;
    } catch (err) {
      console.warn(`Mirror ${API_MIRRORS[mirrorIndex]} failed, rotating...`);
      rotateMirror();
      if (retries > 0) return attemptSearch(retries - 1);
      return [];
    }
  };

  return attemptSearch();
};
