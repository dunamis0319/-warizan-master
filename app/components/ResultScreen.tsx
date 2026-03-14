"use client";
import type { GameResult } from "../lib/types";
import { useSound } from "../hooks/useSound";

interface Props {
  result: GameResult;
  levelUpData: { prevLevel: number; newLevel: number } | null;
  onRetry: () => void;
  onBack: () => void;
}

function StarDisplay({ stars }: { stars: number }) {
  return (
    <div className="flex gap-2 justify-center my-3">
      {[1, 2, 3].map(i => (
        <span
          key={i}
          className={[
            "text-5xl sm:text-6xl transition-all duration-300",
            i <= stars ? "animate-spin-in" : "opacity-20",
          ].join(" ")}
          style={{ animationDelay: `${(i - 1) * 0.15}s` }}
        >
          ⭐
        </span>
      ))}
    </div>
  );
}

function getTitle(config: GameResult["config"]): string {
  if (config.kind === "practice") {
    const m = { nobori: "のぼり", kudari: "くだり", barabara: "ばらばら" }[config.mode];
    return `${config.dan}のだん (${m})`;
  }
  const labels: Record<string, string> = {
    normal: "ノーマル割り算", timeattack: "タイムアタック",
    mazekaze: "まぜこぜ割り算", block: "ブロック割り算",
    mushikui: "虫食い割り算", "answer-first": "答えから割り算",
  };
  return `${labels[config.challengeType] ?? ""} ランク${config.rank}`;
}

function mistakeLabel(m: { question: GameResult["mistakes"][0]["question"]; userAnswer: number }): string {
  const { question: q, userAnswer } = m;
  if (q.displayType === "answer-first") {
    const correct = q.choices?.[q.correctAnswer];
    const chosen  = userAnswer >= 0 ? q.choices?.[userAnswer] : null;
    const correctStr = correct ? `${correct.dividend}÷${correct.divisor}` : "?";
    const chosenStr  = chosen  ? `${chosen.dividend}÷${chosen.divisor}`   : userAnswer === -1 ? "じかんきれ" : "?";
    return `こたえ: ${q.displayAnswer}  →  せいかい: ${correctStr}  （あなた: ${chosenStr}）`;
  }
  if (q.displayType === "mushikui") {
    return `□÷${q.divisor}=${q.dividend / q.divisor}  →  せいかい: ${q.correctAnswer}  （あなた: ${userAnswer === -1 ? "じかんきれ" : userAnswer}）`;
  }
  return `${q.dividend}÷${q.divisor}  →  せいかい: ${q.correctAnswer}  （あなた: ${userAnswer === -1 ? "じかんきれ" : userAnswer}）`;
}

export default function ResultScreen({ result, levelUpData, onRetry, onBack }: Props) {
  const { playClick } = useSound();
  const { config, totalQuestions, correctCount, mistakes, stars, coinsEarned } = result;
  const perfect = stars === 3;

  const heading = perfect
    ? "かんぺき！！🎊"
    : stars === 2
    ? "よくできました！"
    : "がんばったね！";

  return (
    <div className="min-h-screen diamond-bg flex flex-col items-center justify-center px-4 py-8">

      {/* レベルアップ演出 */}
      {levelUpData && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="flex flex-col items-center gap-2 animate-level-up">
            <div className="bg-gradient-to-b from-yellow-300 to-orange-400 border-4 border-yellow-200 rounded-3xl px-10 py-6 shadow-2xl text-center">
              <p className="text-lg font-black text-yellow-900 mb-1">LEVEL UP！！</p>
              <p className="text-5xl font-black text-yellow-900">
                Lv.{levelUpData.prevLevel} → Lv.{levelUpData.newLevel}
              </p>
              <p className="text-sm font-bold text-yellow-800 mt-2">✨ おめでとう！ ✨</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-2xl p-7 w-full max-w-md">
        {/* Trophy / heading */}
        <div className="text-center mb-2">
          {perfect && (
            <div className="text-6xl mb-2 animate-spin-in">🏆</div>
          )}
          <h2 className="text-2xl sm:text-3xl font-black text-gray-800">{heading}</h2>
          <p className="text-sm text-gray-500 mt-1">{getTitle(config)}</p>
        </div>

        {/* Stars */}
        <StarDisplay stars={stars} />

        {/* Score */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-green-50 border-2 border-green-100 rounded-2xl p-3 text-center">
            <div className="text-4xl font-black text-green-600">{correctCount}</div>
            <div className="text-xs text-gray-500 mt-0.5 font-bold">✅ せいかい</div>
          </div>
          <div className="bg-red-50 border-2 border-red-100 rounded-2xl p-3 text-center">
            <div className="text-4xl font-black text-red-500">{totalQuestions - correctCount}</div>
            <div className="text-xs text-gray-500 mt-0.5 font-bold">❌ まちがい</div>
          </div>
        </div>

        {/* Coins */}
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 mb-3 flex items-center justify-center gap-3">
          <span className="text-4xl animate-coin-spin">🪙</span>
          <span className="text-xl font-black text-amber-700">+{coinsEarned} コイン かくとく！</span>
        </div>

        {/* Diamond bonus */}
        {perfect && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 mb-3 flex items-center justify-center gap-3">
            <span className="text-4xl animate-diamond-sparkle">💎</span>
            <span className="text-xl font-black text-blue-700">+1 ダイヤ かくとく！</span>
          </div>
        )}

        {/* Mistakes list */}
        {mistakes.length > 0 && (
          <div className="bg-red-50 border-2 border-red-100 rounded-2xl p-4 mb-4 max-h-44 overflow-y-auto">
            <p className="text-xs font-bold text-red-500 mb-2">❌ まちがえた もんだい</p>
            {mistakes.map((m, i) => (
              <p key={i} className="text-xs text-gray-700 py-1.5 border-b border-red-100 last:border-0 leading-snug">
                {mistakeLabel(m)}
              </p>
            ))}
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => { playClick(); onRetry(); }}
            className="
              w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500
              hover:from-indigo-400 hover:to-purple-400
              text-white font-black text-lg rounded-2xl
              shadow-[0_5px_0_#4338ca]
              active:shadow-[0_2px_0_#4338ca] active:translate-y-0.5
              transition-all duration-100
            "
          >
            🔄 もういちど！
          </button>
          <button
            onClick={() => { playClick(); onBack(); }}
            className="
              w-full py-3.5 border-2 border-gray-200 bg-gray-50
              hover:bg-gray-100
              text-gray-600 font-bold text-base rounded-2xl
              transition-colors
            "
          >
            ← もどる
          </button>
        </div>
      </div>
    </div>
  );
}
