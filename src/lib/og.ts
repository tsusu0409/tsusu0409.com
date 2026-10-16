// OGP画像（1200×630）をビルド時に描画する。Figma: 06 OGP / 採用デザイン
import { readFile } from 'node:fs/promises';
import satori from 'satori';
import sharp from 'sharp';

const W = 1200;
const H = 630;
const C = { mist: '#F1F7F9', paper: '#FFFFFF', ink: '#20343C', muted: '#546C75', blue: '#B8DCE5', line: '#A7C5CE' };

// satoriはWOFF2を読めないため、fontsourceのWOFFを使う（japaneseは英数字も含む）
let fonts: Promise<Parameters<typeof satori>[1]['fonts']> | undefined;
const loadFonts = () =>
  (fonts ??= Promise.all(
    ([400, 500] as const).map(async (weight) => ({
      name: 'Noto Sans JP',
      data: await readFile(`node_modules/@fontsource/noto-sans-jp/files/noto-sans-jp-japanese-${weight}-normal.woff`),
      weight,
    })),
  ));

type Style = Record<string, string | number>;
interface Node { type: string; props: { style: Style; children?: unknown; src?: string } }
const box = (style: Style, children?: unknown): Node => ({ type: 'div', props: { style: { display: 'flex', ...style }, children } });
const at = (left: number, top: number, style: Style, children?: unknown) => box({ position: 'absolute', left, top, ...style }, children);
const text = (left: number, top: number, width: number, size: number, content: string, style: Style = {}) =>
  at(left, top, { width, fontSize: size, lineHeight: 1.5, color: C.muted, ...style }, content);

/** サイト内パス（public/）か外部URLの画像を、枠の大きさのPNGデータURIにする。読めなければnull */
/** fitが'inside'なら余白を足さず、枠に収まる大きさに縮めるだけ */
async function image(src: string, width: number, height: number, fit: 'cover' | 'inside' = 'cover') {
  try {
    let input: Buffer;
    if (/^https?:\/\//.test(src)) {
      const res = await fetch(src);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      input = Buffer.from(await res.arrayBuffer());
    } else {
      input = await readFile(`public${decodeURI(src)}`);
    }
    const { data, info } = await sharp(input).rotate().resize(width, height, { fit }).png().toBuffer({ resolveWithObject: true });
    return { type: 'img', props: { src: `data:image/png;base64,${data.toString('base64')}`, style: { width: info.width, height: info.height } } } as Node;
  } catch (error) {
    console.warn(`[og] ${src} を読み込めませんでした:`, error);
    return null;
  }
}

async function render(children: unknown[]) {
  const svg = await satori(box({ width: W, height: H, background: C.mist, fontFamily: 'Noto Sans JP' }, children) as never, {
    width: W,
    height: H,
    fonts: await loadFonts(),
  });
  return new Uint8Array(await sharp(Buffer.from(svg)).png().toBuffer());
}

export interface PageCard {
  category: string;
  title: string;
  description: string;
  /** 1枚なら右の枠いっぱい、2枚以上なら4分割（空きは白のまま） */
  images: string[];
  /** TOPの縦長の写真 */
  portrait?: boolean;
}

/** TOP・一覧などのポータルページ */
export async function pageCard({ category, title, description, images, portrait }: PageCard) {
  const visual = portrait
    ? [at(76.5, 20, {}, await image(images[0], 223, 336))]
    : images.length === 1
      ? [at(20, 20, {}, await image(images[0], 336, 336))]
      : await Promise.all(images.slice(0, 4).map(async (src, i) => at(20 + (i % 2) * 168, 20 + Math.floor(i / 2) * 168, {}, await image(src, 168, 168))));
  return render([
    at(0, 0, { width: W, height: 12, background: C.blue }),
    at(64, 48, { width: 1072, justifyContent: 'space-between', alignItems: 'center' }, [
      // TOPはタイトル自体が「Tsusu」なので、左上の名前は重ねない
      box({ fontSize: 24, fontWeight: 500, lineHeight: 1.5, color: C.ink }, title === 'Tsusu' ? '' : 'Tsusu'),
      box({ fontSize: 18, lineHeight: 1.75, color: C.muted }, 'tsusu0409.com'),
    ]),
    at(64, 122, { width: 1072, height: 1, background: C.line }),
    text(64, 181, 620, 22, category),
    text(58, 230, 660, 112, title, { fontWeight: 500, color: C.ink }),
    text(64, 440, 608, 26, description),
    at(760, 180, { width: 376, height: 376, background: C.paper }, visual),
  ]);
}

/** タイトルの文字数から大きさを決める。66pxで2行、収まらなければ52px・44pxで3行まで */
export function titleSize(title: string) {
  const units = [...title].reduce((sum, ch) => sum + (ch.charCodeAt(0) < 0x100 ? 0.6 : 1), 0);
  // ponytail: 折り返し位置は文字幅の概算。単語単位の改行で溢れる分は3行で切り詰める
  const fits = (size: number, lines: number) => units * size <= 1076 * lines * 0.9;
  return fits(66, 2) ? 66 : fits(52, 3) ? 52 : 44;
}

export interface PostCard {
  category: string;
  title: string;
  date: string;
  /** タグ、調理時間・人数など */
  meta?: string;
  image?: string | null;
}

/** ブログ記事・レシピの個別ページ */
export async function postCard({ category, title, date, meta, image: src }: PostCard) {
  const size = titleSize(title);
  const thumb = src ? await image(src, 436, 202, 'inside') : null;
  return render([
    text(64, 48, 1072, 22, category),
    text(60, 116, 1076, size, title, { fontWeight: 500, lineHeight: 1.4, color: C.ink, display: 'block', lineClamp: 3 }),
    at(64, 336, { width: 1072, height: 1, background: C.line }),
    text(64, 376, 560, 26, date),
    ...(meta ? [text(64, 432, 560, 24, meta, { whiteSpace: 'pre-wrap' })] : []),
    text(64, 528, 560, 28, 'Tsusu / tsusu0409.com', { fontWeight: 500, color: C.ink }),
    // サムネイルがなければ枠ごと出さない
    ...(thumb ? [at(700, 368, { width: 436, height: 202, justifyContent: 'center', alignItems: 'center' }, thumb)] : []),
  ]);
}
