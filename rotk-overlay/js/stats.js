// Every stat ROTK gives us. The order here is the order they show up on screen.
// To add a stat: add a line here (and in normalize() in api.js if it's a new field).

const num = (n) => (n == null ? null : Number(n).toLocaleString());

export const STATS = [
  { id: 'name',       label: 'Name',            on: true, get: (d) => d.name },
  { id: 'season',     label: 'Season',          get: (d) => d.season },
  { id: 'mode',       label: 'Mode',            get: (d) => d.mode },
  { id: 'region',     label: 'Region',          get: (d) => d.region?.toUpperCase() },
  { id: 'rank',       label: 'Rank',            on: true, get: (d) => (d.rank == null ? null : '#' + num(d.rank)) },
  { id: 'score',      label: 'Score',           get: (d) => num(d.score) },
  { id: 'bestScore',  label: 'Best score',      get: (d) => num(d.bestScore) },
  { id: 'games',      label: 'Games',           get: (d) => num(d.games) },
  { id: 'counted',    label: 'Counted games',   get: (d) => num(d.countedGames) },
  { id: 'wins',       label: 'Wins',            on: true, get: (d) => num(d.wins) },
  { id: 'winrate',    label: 'Win rate',        get: (d) => (d.winrate == null ? null : d.winrate + '%') },
  { id: 'kills',      label: 'Kills',           on: true, get: (d) => num(d.kills) },
  { id: 'deaths',     label: 'Deaths',          get: (d) => num(d.deaths) },
  { id: 'kd',         label: 'K/D',             on: true, get: (d) => d.kd?.toFixed(2) },
  { id: 'avgKills',   label: 'Avg kills',       get: (d) => d.avgKills },
  { id: 'avgPlace',   label: 'Avg placement',   get: (d) => d.avgPlacement },
  { id: 'bestKills',  label: 'Best game kills', get: (d) => d.bestGame?.kills },
  { id: 'bestPlace',  label: 'Best game place', get: (d) => d.bestGame?.placement },
  {
    id: 'lastPlayed',
    label: 'Last played',
    get: (d) => d.lastPlayed && new Date(d.lastPlayed).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
  },
];
