const BASE = 'https://rotk.app/api/overlay/';

// Pulls the key/region/mode out of a ROTK overlay link.
// Works with both rotk.app/overlay/... and rotk.app/api/overlay/...
export function parseRotkLink(text) {
  const match = String(text).match(/rotk\.app\/(?:api\/)?overlay\/([\w-]+)/);
  if (!match) return null;

  let region = 'na';
  let mode = 'solo';
  try {
    const q = new URL(text.trim()).searchParams;
    region = q.get('region') || region;
    mode = q.get('mode') || mode;
  } catch {
    // no https:// on the front, just use the defaults
  }
  return { key: match[1], region, mode };
}

export async function fetchStats({ key, region, mode }) {
  const url = `${BASE}${encodeURIComponent(key)}?region=${encodeURIComponent(region)}&mode=${encodeURIComponent(mode)}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`ROTK returned ${res.status}`);
  return normalize(await res.json());
}

// ROTK's field names stop here. The rest of the app only ever sees this shape,
// so if they change their API this is the only thing that needs fixing.
export function normalize(raw) {
  const s = raw.stats || {};
  return {
    name: raw.player?.displayName,
    season: raw.season?.name,
    mode: raw.mode,
    region: raw.region,
    rank: s.rank,
    score: s.score,
    bestScore: s.bestScore,
    games: s.games,
    countedGames: s.countedGames ?? raw.countedGames,
    wins: s.wins,
    winrate: s.winrate,
    kills: s.kills,
    deaths: s.deaths,
    kd: s.kd,
    avgKills: s.averageKills,
    avgPlacement: s.averagePlacement,
    bestGame: s.bestKillGame,
    lastPlayed: s.lastPlayed,
  };
}

// Made-up numbers so the preview has something to show before a link is pasted
export const SAMPLE = normalize({
  mode: 'solo',
  region: 'na',
  player: { displayName: 'YourName' },
  season: { name: 'Season 1' },
  stats: {
    rank: 1234, score: 482150, bestScore: 61200, games: 88, countedGames: 10,
    wins: 3, winrate: 3.4, kills: 142, deaths: 85, kd: 1.67,
    averageKills: 5.2, averagePlacement: 41.3,
    bestKillGame: { kills: 11, placement: 1 },
    lastPlayed: new Date().toISOString(),
  },
});
