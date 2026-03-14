export type AppScreen = "title" | "practiceSelect" | "challengeSelect" | "game" | "result" | "ending" | "settings";
export type PracticeMode = "nobori" | "kudari" | "barabara";
export type ChallengeType =
  | "normal"
  | "timeattack"
  | "mazekaze"
  | "block"
  | "mushikui"
  | "answer-first";

export interface PracticeConfig {
  kind: "practice";
  dan: number;
  mode: PracticeMode;
}

export interface ChallengeConfig {
  kind: "challenge";
  challengeType: ChallengeType;
  rank: number;
}

export type GameConfig = PracticeConfig | ChallengeConfig;

export interface EquationChoice {
  dividend: number;
  divisor: number;
}

export interface Question {
  dividend: number;
  divisor: number;
  /** What the player must input:
   *  - normal / block / timeattack / mazekaze → quotient (1-9)
   *  - mushikui → dividend (1-81)
   *  - answer-first → index of correct choice in choices[]
   */
  correctAnswer: number;
  displayType: "normal" | "mushikui" | "answer-first" | "block";
  choices?: EquationChoice[]; // answer-first only
  displayAnswer?: number;     // answer-first: quotient shown to player
}

export interface MistakeRecord {
  question: Question;
  userAnswer: number; // -1 = timeout
}

export interface GameResult {
  config: GameConfig;
  totalQuestions: number;
  correctCount: number;
  mistakes: MistakeRecord[];
  stars: number;
  coinsEarned: number;
}

export interface SaveData {
  coins: number;
  diamonds: number;
  level: number;                              // プレイヤーレベル（1-20）
  allClear: boolean;                          // 全チャレンジクリア済み
  practiceStars: Record<string, number>;      // `${dan}_${mode}` → 0-3
  challengeStars: Record<string, number>;     // `${type}_${rank}` → 0-3
  challengeUnlocked: Record<string, boolean>; // `${type}_${rank}`
}
