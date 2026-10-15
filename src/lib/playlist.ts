// 保存済みSpotifyデータをPlaylistページ用に整形する純粋関数。

interface RawTrack {
  name?: string;
  duration_ms?: number;
  external_urls?: { spotify?: string };
  artists?: { name: string }[];
  album?: { name?: string; images?: { url: string; width?: number }[] };
}

export interface RawPlaylist {
  name: string;
  external_urls?: { spotify?: string };
  tracks: { total: number; items: { track: RawTrack | null }[] };
}

export interface Track {
  name: string;
  artists: string;
  url?: string;
  image?: string;
  album: string;
}

export interface Month {
  key: string; // "2026.07"
  tracks: Track[];
  duration: string;
  spotifyUrl?: string;
  covers: string[];
}

/** 一覧用には小さい画像、カバー用には中サイズを選ぶ */
const pickImage = (images: { url: string; width?: number }[] = [], min: number) =>
  [...images].sort((a, b) => (a.width ?? 0) - (b.width ?? 0)).find((i) => (i.width ?? 0) >= min)?.url ?? images[0]?.url;

export function formatDuration(ms: number): string {
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
}

/** null・削除済みの曲は飛ばし、表示できる曲だけを数える。新しい月が先頭。 */
export function toMonths(playlists: RawPlaylist[]): Month[] {
  return playlists
    .filter((p) => /^\d{4}\.(0[1-9]|1[0-2])$/.test(p.name))
    .map((p) => {
      const valid = p.tracks.items.map((i) => i.track).filter((t): t is RawTrack => !!t?.name);
      const covers = [...new Set(valid.map((t) => pickImage(t.album?.images, 300)).filter(Boolean) as string[])];
      return {
        key: p.name,
        tracks: valid.map((t) => ({
          name: t.name!,
          artists: (t.artists ?? []).map((a) => a.name).join(', '),
          url: t.external_urls?.spotify,
          image: pickImage(t.album?.images, 64),
          album: t.album?.name ?? '',
        })),
        duration: formatDuration(valid.reduce((sum, t) => sum + (t.duration_ms ?? 0), 0)),
        spotifyUrl: p.external_urls?.spotify,
        covers: covers.slice(0, 4),
      };
    })
    .sort((a, b) => b.key.localeCompare(a.key));
}

export type ArchiveRow =
  | { type: 'year'; year: number; months: { label: string; key: string; enabled: boolean }[] }
  | { type: 'gap' };

/** 12〜01の月ボタンを年ごとに並べ、データのない連続した年は1つの「⋮」に畳む */
export function archiveRows(keys: string[]): ArchiveRow[] {
  const available = new Set(keys);
  const years = keys.map((k) => Number(k.slice(0, 4)));
  if (!years.length) return [];
  const rows: ArchiveRow[] = [];
  for (let year = Math.max(...years); year >= Math.min(...years); year--) {
    if (!years.includes(year)) {
      if (rows.at(-1)?.type !== 'gap') rows.push({ type: 'gap' });
      continue;
    }
    const months = Array.from({ length: 12 }, (_, i) => {
      const label = String(12 - i).padStart(2, '0');
      const key = `${year}.${label}`;
      return { label, key, enabled: available.has(key) };
    });
    rows.push({ type: 'year', year, months });
  }
  return rows;
}
