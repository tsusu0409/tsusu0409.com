# tsusu0409.com

Astro + Tailwind CSS の個人サイト（v4）。デザインは Figma「ver4.0」。

## コマンド

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 保存済みデータで開発サーバー（draft のレシピ・記事も表示） |
| `npm run build` | 静的ビルド。外部APIには接続しない |
| `npm run check` | Astro・TypeScript の型検査 |
| `npm run test:unit` | 記事統合・ページ送り・Playlist・コードメタの単体テスト |
| `npm run test:migration` | 旧サイトからの移行検証（記事本文・public・Activity・Spotify） |
| `npm run data:posts` | note / おもしろ界隈 / Qiita / Zenn の RSS を `src/data/external-posts.json` へ累積マージ |
| `npm run data:spotify` | Spotify の月別プレイリストを `src/data/spotify-playlists.json` へ保存（`.env` に `SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET / SPOTIFY_REFRESH_TOKEN`） |

## コンテンツ

- ブログ: `src/content/blog/YYYY-MM-DD.md`。ファイル名がそのまま `/blog/[ファイル名]/` になる。`draft: true` で非公開。
- レシピ: `src/content/recipes/*.md`（スキーマは `src/content.config.ts`）。現在の6件は開発用の仮データ（`draft: true`、写真の出典は `public/recipeImages/placeholder/CREDITS.md`）。
- Markdown表示の確認: 開発サーバーで `/dev/all-syntax/`（`tests/fixtures/markdown/`、本番では生成しない）。

### コードブロックの記法

````markdown
```ts title="src/lib/posts.ts" {4-5}
```
````

- `title="..."` ファイル名の表示 / `{4-5}` 行の強調
- 行番号は既定で表示。`sh`・`bash` など端末系、`title="Terminal"`、言語なしは非表示
- `showLineNumbers` / `noLineNumbers` で上書き
- `diff` は `+` / `-` 行を背景色で区別
- 注記は `> [!NOTE]`（TIP / IMPORTANT / WARNING / CAUTION）、数式は `$...$` / `$$...$$`、図は ```` ```mermaid ````
