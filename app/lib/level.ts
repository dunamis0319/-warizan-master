/** レベル閾値：累計コイン数 (Lv1=index0, Lv20=index19) */
const THRESHOLDS = [
     0,   // Lv1  わり算みならい
   100,   // Lv2
   250,   // Lv3
   450,   // Lv4
   700,   // Lv5  わり算せんし
  1000,   // Lv6
  1400,   // Lv7
  1900,   // Lv8
  2500,   // Lv9
  3200,   // Lv10 わり算名人
  4100,   // Lv11
  5100,   // Lv12
  6300,   // Lv13
  7700,   // Lv14
  9300,   // Lv15
 11200,   // Lv16
 13400,   // Lv17
 16000,   // Lv18
 19000,   // Lv19
 22500,   // Lv20 わり算マスター（MAX）
] as const;

const MAX_LEVEL = THRESHOLDS.length; // 20

/** 累計コインからレベルを計算 */
export function calcLevel(coins: number): number {
  let lv = 1;
  for (let i = 1; i < THRESHOLDS.length; i++) {
    if (coins >= THRESHOLDS[i]) lv = i + 1;
    else break;
  }
  return Math.min(lv, MAX_LEVEL);
}

/** レベルに対応する称号 */
export function getLevelTitle(level: number): string {
  if (level >= 20) return "わり算マスター";
  if (level >= 10) return "わり算名人";
  if (level >= 5)  return "わり算せんし";
  return "わり算みならい";
}

export interface LevelProgress {
  level: number;
  title: string;
  progressCoins: number; // 現レベル内での進捗コイン
  neededCoins: number;   // 次レベルに必要なコイン
  pct: number;           // 進捗 % (0-100)
  isMax: boolean;
}

/** レベルの進捗情報を返す */
export function getLevelProgress(coins: number): LevelProgress {
  const level = calcLevel(coins);
  const title = getLevelTitle(level);
  const isMax = level >= MAX_LEVEL;

  if (isMax) {
    return { level, title, progressCoins: 0, neededCoins: 0, pct: 100, isMax };
  }

  const start        = THRESHOLDS[level - 1];
  const end          = THRESHOLDS[level];
  const progressCoins = coins - start;
  const neededCoins   = end - start;
  const pct = Math.min(100, Math.round((progressCoins / neededCoins) * 100));

  return { level, title, progressCoins, neededCoins, pct, isMax };
}
