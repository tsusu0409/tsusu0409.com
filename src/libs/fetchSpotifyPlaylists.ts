import dotenv from 'dotenv';
dotenv.config();

interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: { url: string; height: number; width: number }[];
  tracks: {
    total: number;
    items: SpotifyTrackItem[];
  };
}

interface SpotifyTrackItem {
  added_at: string;
  track: {
    id: string;
    name: string;
    duration_ms: number;
    explicit: boolean;
    external_urls: { spotify: string };
    preview_url: string | null;
    artists: { name: string; external_urls: { spotify: string } }[];
    album: {
      name: string;
      release_date: string;
      images: { url: string; height: number; width: number }[];
      external_urls: { spotify: string };
    };
  };
}

const SPOTIFY_ACCESS_TOKEN = process.env.SPOTIFY_ACCESS_TOKEN;

if (!SPOTIFY_ACCESS_TOKEN) {
  throw new Error('SPOTIFY_ACCESS_TOKEN environment variable is required');
}

async function fetchPlaylist(playlistId: string): Promise<SpotifyPlaylist> {
  const response = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}`,
    {
      headers: {
        Authorization: `Bearer ${SPOTIFY_ACCESS_TOKEN}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch playlist ${playlistId}: ${response.statusText}`);
  }

  return response.json();
}

async function fetchAllPlaylists(playlistIds: string[]) {
  const playlists = await Promise.all(
    playlistIds.map((id) => fetchPlaylist(id))
  );

  // プレイリスト名でソート（新しい順）
  return playlists.sort((a, b) => b.name.localeCompare(a.name));
}

// 使用例
const PLAYLIST_IDS = [
  // ここに自分のプレイリストIDを追加
  '32DyphXHyhasqHxCh09uXw', // 2025.10
  '00XhZfXV3F8e7ibsAFmw1C', // 2025.09
  '5jw4FqzOmqxbAXTn7bIRMc', // 2021.07
  '1T6EU6r6uz2RPZ9tXXVKQz', // 2021.06
  '6VNSAff97arK3yTM5qYYKU', // 2021.05
  '0WyYabUSqfSF4bAJDLIYS4', // 2021.04
  '5hz4IzS85De3x5h1SJWWaS', // 2021.03
  '6fFEvumv15aiVVwlG6gRyP', // 2021.02
];

export async function getSpotifyData() {
  return await fetchAllPlaylists(PLAYLIST_IDS);
}

// ビルド時に実行してJSONファイルに保存
if (import.meta.url === `file://${process.argv[1]}`) {
  const fs = await import('fs/promises');
  const data = await getSpotifyData();
  await fs.writeFile(
    'src/data/spotify-playlists.json',
    JSON.stringify(data, null, 2)
  );
  console.log('✅ Spotify playlists data saved!');
}