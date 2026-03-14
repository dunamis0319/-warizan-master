"use client";
import { useEffect, useState } from "react";
import Fireworks from "./Fireworks";
import { useSound } from "../hooks/useSound";
import type { SaveData } from "../lib/types";

interface Props {
  saveData: SaveData;
  onPlayAgain: () => void;
  onTitle: () => void;
}

type FloatItem = {
  id: number;
  x: number;
  emoji: string;
  dur: number;
  delay: number;
  size: number;
};

const FLOAT_EMOJIS = ["🪙", "⭐", "✨", "🌟", "💫", "🎊", "🎉", "🏆", "💎", "🎆"];

function makeFloatItems(): FloatItem[] {
  return Array.from({ length: 25 }, (_, i) => ({
    id: i,
    x: 2 + Math.random() * 96,
    emoji: FLOAT_EMOJIS[Math.floor(Math.random() * FLOAT_EMOJIS.length)],
    dur:   3 + Math.random() * 2.5,
    delay: Math.random() * 5,
    size:  1.3 + Math.random() * 1.8,
  }));
}

export default function EndingScreen({ saveData, onPlayAgain, onTitle }: Props) {
  const { playClear, playClick } = useSound();

  const [fireTrigger, setFireTrigger] = useState(1);
  const [floatItems] = useState<FloatItem[]>(makeFloatItems);

  useEffect(() => {
    playClear();
    const id = setInterval(() => setFireTrigger(t => t + 1), 1400);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen space-bg flex flex-col items-center justify-between py-10 px-4 overflow-hidden relative">
      <Fireworks trigger={fireTrigger} />

      {/* 浮かぶアイテム */}
      <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
        {floatItems.map(item => (
          <span
            key={item.id}
            className="absolute animate-ending-float"
            style={{
              left:     `${item.x}%`,
              bottom:   "-8%",
              fontSize: `${item.size}rem`,
              "--dur":   `${item.dur}s`,
              "--delay": `${item.delay}s`,
            } as React.CSSProperties}
          >
            {item.emoji}
          </span>
        ))}
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col items-center justify-center gap-5 w-full relative z-20">

        {/* 装飾 🎉 */}
        <div className="text-5xl sm:text-6xl animate-bob" style={{ animationDelay: "0.3s" }}>🎉</div>

        {/* トロフィー */}
        <div className="text-8xl sm:text-9xl animate-spin-in drop-shadow-2xl" style={{ animationDelay: "0.1s" }}>
          🏆
        </div>

        {/* "わり算マスター！" ロゴ */}
        <div className="animate-bob drop-shadow-2xl" style={{ animationDelay: "0.2s" }}>
          <svg
            viewBox="0 0 640 120"
            className="w-full max-w-[380px] sm:max-w-[460px]"
            overflow="visible"
            aria-label="わり算マスター！"
          >
            <defs>
              <linearGradient id="endGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFE566" />
                <stop offset="50%" stopColor="#FF9900" />
                <stop offset="100%" stopColor="#FF4400" />
              </linearGradient>
              <filter id="endShadow">
                <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#FF6600" floodOpacity="0.7" />
              </filter>
            </defs>
            <text
              x="50%" y="88"
              textAnchor="middle"
              fill="url(#endGrad)"
              stroke="#1a0000"
              strokeWidth="9"
              paintOrder="stroke fill"
              fontSize="62"
              fontWeight="900"
              fontFamily="'Nunito','Hiragino Kaku Gothic ProN','Meiryo',sans-serif"
              letterSpacing="3"
              filter="url(#endShadow)"
            >
              わり算マスター！
            </text>
          </svg>
        </div>

        {/* 装飾 🎉 */}
        <div className="text-5xl sm:text-6xl animate-bob" style={{ animationDelay: "0.5s" }}>🎉</div>

        {/* ALL CLEAR バッジ */}
        <div className="animate-badge-pulse bg-yellow-400 border-4 border-yellow-200 rounded-3xl px-8 py-3 shadow-2xl">
          <p className="font-black text-2xl sm:text-3xl text-yellow-900 tracking-widest text-center">
            ⭐ ALL CLEAR ⭐
          </p>
        </div>

        {/* メッセージ */}
        <p className="text-white font-black text-lg sm:text-xl drop-shadow-lg text-center leading-loose">
          ぜんぶのチャレンジを<br />
          クリアしたよ！　さいこう！！🌟
        </p>

        {/* スタット */}
        <div className="flex gap-4">
          <div className="bg-white/15 backdrop-blur-sm border border-white/25 rounded-2xl px-5 py-4 flex items-center gap-3 shadow-lg">
            <span className="text-3xl animate-coin-spin">🪙</span>
            <div>
              <div className="font-black text-2xl text-yellow-300">{saveData.coins.toLocaleString()}</div>
              <div className="text-[10px] text-white/60 font-bold">コイン</div>
            </div>
          </div>
          <div className="bg-white/15 backdrop-blur-sm border border-white/25 rounded-2xl px-5 py-4 flex items-center gap-3 shadow-lg">
            <span className="text-3xl animate-diamond-sparkle">💎</span>
            <div>
              <div className="font-black text-2xl text-cyan-300">{saveData.diamonds.toLocaleString()}</div>
              <div className="text-[10px] text-white/60 font-bold">ダイヤ</div>
            </div>
          </div>
        </div>

        {/* ボタン */}
        <div className="flex flex-col gap-4 w-full max-w-xs sm:max-w-sm mt-2">
          <button
            onClick={() => { playClick(); onPlayAgain(); }}
            className="
              bg-red-500 hover:bg-red-400
              text-white font-black text-xl py-5 rounded-2xl
              shadow-[0_7px_0_#991b1b]
              active:shadow-[0_2px_0_#991b1b] active:translate-y-1
              transition-all duration-100 select-none
              border-t-2 border-red-300/50
            "
          >
            🔄 もう一度あそぶ
          </button>
          <button
            onClick={() => { playClick(); onTitle(); }}
            className="
              bg-white/15 hover:bg-white/25 backdrop-blur-sm
              border-2 border-white/30
              text-white font-black text-lg py-4 rounded-2xl
              shadow-[0_4px_0_rgba(0,0,0,0.3)]
              active:shadow-[0_1px_0_rgba(0,0,0,0.3)] active:translate-y-0.5
              transition-all duration-100 select-none
            "
          >
            🏠 タイトルにもどる
          </button>
        </div>
      </div>
    </div>
  );
}
