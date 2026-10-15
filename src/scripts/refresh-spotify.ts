import dotenv from 'dotenv';
dotenv.config();

interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  external_urls?: { spotify: string };
  images: { url: string; height: number; width: number }[];
  tracks: {
    total: number;
    items: SpotifyTrackItem[];
  };
}

interface SpotifyPlaylistSummary {
  id: string;
  name: string;
  owner: {
    id: string;
  };
}

interface SpotifyPaging<T> {
  items: T[];
  next: string | null;
}

interface SpotifyCurrentUser {
  id: string;
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

// 追加: 指定ミリ秒待機するヘルパー関数
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const MONTHLY_PLAYLIST_NAME_PATTERN = /^\d{4}\.(0[1-9]|1[0-2])$/;

async function getAccessToken(retries = 3): Promise<string> {
  console.log('🔄 アクセストークンを取得中...');
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
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

      if (response.ok) {
        const data = await response.json();
        console.log('✅ アクセストークン取得成功');
        return data.access_token;
      }

      // 失敗した場合のエラーハンドリング
      const errorText = await response.text();
      
      // まだリトライできる場合
      if (attempt < retries) {
        console.warn(`⚠️ アクセストークン取得失敗 (${response.status})。2秒後に再試行します (${attempt}/${retries})...`);
        await delay(2000); // 2秒待機して再試行
        continue;
      }

      // リトライ上限に達した場合
      throw new Error(`アクセストークン取得失敗: ${response.statusText} - ${errorText}`);

    } catch (error) {
      if (attempt < retries) {
        console.warn(`⚠️ ネットワークエラー発生。2秒後に再試行します (${attempt}/${retries})...`);
        await delay(2000);
        continue;
      }
      throw error;
    }
  }
  
  throw new Error('予期せぬエラー: トークンを取得できませんでした');
}

async function fetchSpotifyJson<T>(url: string, accessToken: string, label: string, retries = 3): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.ok) {
      return response.json();
    }

    // 429 Too Many Requests の場合は Retry-After ヘッダーを見て待機する
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      const waitTime = retryAfter ? parseInt(retryAfter, 10) * 1000 : 2000;
      console.warn(`⚠️ [${label}] レート制限(429)に達しました。${waitTime / 1000}秒待機します...`);
      await delay(waitTime);
      continue;
    }

    // それ以外のエラーで、まだリトライ回数が残っている場合
    if (attempt < retries) {
      console.warn(`⚠️ [${label}] 取得失敗 (${response.status} ${response.statusText})。1秒後に再試行します (${attempt}/${retries})...`);
      await delay(1000);
      continue;
    }

    // 全てのリトライに失敗した場合
    const errorText = await response.text();
    throw new Error(`Spotify API取得失敗 ${label}: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  throw new Error('予期せぬエラー');
}

// 修正: リトライ処理を追加
async function fetchPlaylist(playlistId: string, accessToken: string): Promise<SpotifyPlaylist> {
  return fetchSpotifyJson<SpotifyPlaylist>(
    `https://api.spotify.com/v1/playlists/${playlistId}`,
    accessToken,
    playlistId
  );
}

async function fetchCurrentUser(accessToken: string): Promise<SpotifyCurrentUser> {
  return fetchSpotifyJson<SpotifyCurrentUser>(
    'https://api.spotify.com/v1/me',
    accessToken,
    'current user'
  );
}

async function fetchMonthlyPlaylistIds(accessToken: string): Promise<string[]> {
  const currentUser = await fetchCurrentUser(accessToken);
  const matchedPlaylists: SpotifyPlaylistSummary[] = [];
  let url: string | null = 'https://api.spotify.com/v1/me/playlists?limit=50';

  console.log('🔎 自分のプレイリスト一覧から YYYY.MM 形式のものを検索中...');

  while (url) {
    const page: SpotifyPaging<SpotifyPlaylistSummary> = await fetchSpotifyJson(
      url,
      accessToken,
      'playlists'
    );

    matchedPlaylists.push(
      ...page.items.filter((playlist: SpotifyPlaylistSummary) =>
        playlist.owner.id === currentUser.id &&
        MONTHLY_PLAYLIST_NAME_PATTERN.test(playlist.name)
      )
    );

    url = page.next;

    if (url) {
      await delay(300);
    }
  }

  const sortedPlaylists = matchedPlaylists.sort((a, b) => b.name.localeCompare(a.name));

  console.log(`✅ 対象プレイリスト検出完了: ${sortedPlaylists.length}件`);
  sortedPlaylists.forEach((playlist) => {
    console.log(`   - ${playlist.name} (${playlist.id})`);
  });

  return sortedPlaylists.map((playlist) => playlist.id);
}

// 修正: Promise.allを廃止し、直列（for...of）に変更
async function fetchAllPlaylists() {
  const accessToken = await getAccessToken();
  const playlistIds = await fetchMonthlyPlaylistIds(accessToken);

  if (playlistIds.length === 0) {
    throw new Error('YYYY.MM 形式の自分のプレイリストが見つかりませんでした');
  }

  console.log(`📝 ${playlistIds.length}個のプレイリストを順番に取得中...`);
  
  const playlists: SpotifyPlaylist[] = [];
  
  for (let i = 0; i < playlistIds.length; i++) {
    const id = playlistIds[i];
    console.log(`⬇️  (${i + 1}/${playlistIds.length}) 取得中: ${id}`);
    
    const playlist = await fetchPlaylist(id, accessToken);
    playlists.push(playlist);
    
    // サーバー負荷軽減のため、次のリクエストまで少し待機（最後のリクエスト後は不要）
    if (i < playlistIds.length - 1) {
      await delay(300);
    }
  }

  console.log('✅ 全プレイリスト取得完了');

  return playlists.sort((a, b) => b.name.localeCompare(a.name));
}

export async function getSpotifyData() {
  return await fetchAllPlaylists();
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
