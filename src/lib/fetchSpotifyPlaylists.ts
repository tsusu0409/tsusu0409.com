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

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;

if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) {
  console.error('❌ 環境変数が不足しています');
  console.error('');
  console.error('以下を .env ファイルに設定してください:');
  console.error('  SPOTIFY_CLIENT_ID=...');
  console.error('  SPOTIFY_CLIENT_SECRET=...');
  console.error('  SPOTIFY_REFRESH_TOKEN=...');
  console.error('');
  console.error('💡 リフレッシュトークンの取得方法:');
  console.error('   node get-spotify-token.js を実行してください');
  process.exit(1);
}

/**
 * リフレッシュトークンから新しいアクセストークンを自動取得
 * これが自動化の要！
 */
async function getAccessToken(): Promise<string> {
  console.log('🔄 アクセストークンを取得中...');
  
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(
        `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
      ).toString('base64')}`
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: SPOTIFY_REFRESH_TOKEN as string
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`アクセストークン取得失敗: ${response.statusText} - ${error}`);
  }

  const data = await response.json();
  console.log('✅ アクセストークン取得成功');
  return data.access_token;
}

async function fetchPlaylist(playlistId: string, accessToken: string): Promise<SpotifyPlaylist> {
  const response = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`プレイリスト取得失敗 ${playlistId}: ${response.statusText}`);
  }

  return response.json();
}

async function fetchAllPlaylists(playlistIds: string[]) {
  // 毎回自動で新しいアクセストークンを取得
  const accessToken = await getAccessToken();

  console.log(`📝 ${playlistIds.length}個のプレイリストを取得中...`);
  
  const playlists = await Promise.all(
    playlistIds.map((id) => fetchPlaylist(id, accessToken))
  );

  console.log('✅ 全プレイリスト取得完了');

  // プレイリスト名でソート（新しい順）
  return playlists.sort((a, b) => b.name.localeCompare(a.name));
}

const PLAYLIST_IDS = [
  '5V02xkYfmeoZ230oBI1oD2', // 2025.12
  '2VdSLva4LVAzaeAC1GHK41', // 2025.11
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
  console.log('✅ Spotifyプレイリストデータ保存完了!');
}