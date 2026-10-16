// 本番用：10秒間ホバーすると顔写真へのフェードを開始する。
export const PORTRAIT_HOVER_MS = 10_000;

/** Only uninterrupted time over the portrait contributes to revealing it. */
export function createHoverToReveal(reveal: () => void) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let revealed = false;

  return {
    start() {
      if (revealed || timer !== undefined) return;
      timer = setTimeout(() => {
        timer = undefined;
        revealed = true;
        reveal();
      }, PORTRAIT_HOVER_MS);
    },
    cancel() {
      if (timer !== undefined) clearTimeout(timer);
      timer = undefined;
    },
  };
}
