import dotenv from 'dotenv';
dotenv.config();

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

async function getSpotifyToken() {
  try {
    console.log('\n🔍 デバッグ情報:');
    console.log(`CLIENT_ID: ${CLIENT_ID ? CLIENT_ID.substring(0, 10) + '...' : '(未設定)'}`);
    console.log(`CLIENT_SECRET: ${CLIENT_SECRET ? CLIENT_SECRET.substring(0, 10) + '...' : '(未設定)'}`);
    
    // Basic認証のための文字列を作成
    const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    console.log('\n📡 Spotify APIにリクエスト中...\n');

    // Spotify APIにPOSTリクエスト
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`
      },
      body: 'grant_type=client_credentials'
    });

    console.log(`ステータスコード: ${response.status} ${response.statusText}`);

    const data = await response.json();
    
    if (!response.ok) {
      console.error('\n❌ APIエラー:');
      console.error(JSON.stringify(data, null, 2));
      throw new Error(`Failed to get token: ${response.status} ${data.error_description || data.error}`);
    }

    if (!data.access_token) {
      console.error('\n❌ レスポンスにaccess_tokenが含まれていません:');
      console.error(JSON.stringify(data, null, 2));
      throw new Error('No access token in response');
    }
    
    // 結果を表示
    console.log('\n🎵 Spotify Access Token取得成功!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n以下の行を .env ファイルにコピペしてください:\n');
    console.log(`SPOTIFY_ACCESS_TOKEN=${data.access_token}`);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\n⏰ 有効期限: ${data.expires_in}秒 (約${Math.floor(data.expires_in / 60)}分)`);
    console.log('💡 トークンは1時間で期限切れになるので、ビルド前に再取得してください\n');

    return data.access_token;
  } catch (error) {
    console.error('\n❌ エラーが発生しました:');
    console.error(error instanceof Error ? error.message : String(error));
    console.error('\n💡 確認事項:');
    console.error('  1. CLIENT_IDとCLIENT_SECRETが正しく設定されているか');
    console.error('  2. Spotify Developer Dashboardでアプリが作成されているか');
    console.error('  3. インターネット接続が正常か\n');
    process.exit(1);
  }
}

getSpotifyToken();
