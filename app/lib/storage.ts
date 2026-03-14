import type { SaveData } from "./types";

const KEY = "warizan-master-v2";

const DEFAULTS: SaveData = {
  coins: 0,
  diamonds: 0,
  practiceStars: {},
  challengeStars: {},
  challengeUnlocked: {
    normal_1: true,
    timeattack_1: true,
    mazekaze_1: true,
    block_1: true,
    mushikui_1: true,
    "answer-first_1": true,
  },
};

export function loadSave(): SaveData {
  if (typeof window === "undefined") return structuredClone(DEFAULTS);
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(DEFAULTS);
    const p = JSON.parse(raw) as Partial<SaveData>;
    return {
      coins: p.coins ?? 0,
      diamonds: p.diamonds ?? 0,
      practiceStars: p.practiceStars ?? {},
      challengeStars: p.challengeStars ?? {},
      challengeUnlocked: { ...DEFAULTS.challengeUnlocked, ...(p.challengeUnlocked ?? {}) },
    };
  } catch {
    return structuredClone(DEFAULTS);
  }
}

export function writeSave(data: SaveData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(data));
}
