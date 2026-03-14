"use client";
import { useSound } from "../hooks/useSound";

interface Props {
  coins: number;
  diamonds: number;
  onPractice: () => void;
  onChallenge: () => void;
}

export default function TitleScreen({ coins, diamonds, onPractice, onChallenge }: Props) {
  const { playClick } = useSound();

  return (
    <div className="min-h-screen diamond-bg flex flex-col items-center justify-between py-10 px-4">
      {/* Title + buttons */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 w-full">
        {/* Logo (SVG gradient + black outline) */}
        <div className="animate-bob drop-shadow-2xl">
          <svg
            viewBox="0 0 580 130"
            className="w-full max-w-[420px]"
            overflow="visible"
            aria-label="割り算マスター"
          >
            <defs>
              <linearGradient id="tg" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFE566" />
                <stop offset="100%" stopColor="#FF8800" />
              </linearGradient>
            </defs>
            <text
              x="50%" y="95"
              textAnchor="middle"
              fill="url(#tg)"
              stroke="#000"
              strokeWidth="8"
              paintOrder="stroke fill"
              fontSize="74"
              fontWeight="900"
              fontFamily="'Nunito','Hiragino Kaku Gothic ProN','Meiryo',sans-serif"
              letterSpacing="4"
            >
              割り算マスター
            </text>
          </svg>
        </div>

        {/* Subtitle */}
        <p className="text-white font-black text-base sm:text-lg drop-shadow-lg tracking-widest">
          ÷ わり算 れんしゅう ゲーム ÷
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button
            onClick={() => { playClick(); onPractice(); }}
            className="
              bg-red-500 hover:bg-red-600 active:bg-red-700
              text-white font-black text-2xl py-5 rounded-2xl
              shadow-[0_6px_0_#991b1b]
              active:shadow-[0_2px_0_#991b1b] active:translate-y-1
              transition-all duration-100 select-none
            "
          >
            🔢 割り算れんしゅう
          </button>
          <button
            onClick={() => { playClick(); onChallenge(); }}
            className="
              bg-blue-500 hover:bg-blue-600 active:bg-blue-700
              text-white font-black text-2xl py-5 rounded-2xl
              shadow-[0_6px_0_#1e3a8a]
              active:shadow-[0_2px_0_#1e3a8a] active:translate-y-1
              transition-all duration-100 select-none
            "
          >
            ⚡ 割り算チャレンジ
          </button>
        </div>
      </div>

      {/* Coin / Diamond display */}
      <div className="flex gap-4 mt-4">
        <div className="bg-white/90 rounded-2xl px-5 py-3 flex items-center gap-2 shadow-lg">
          <span className="text-2xl">🪙</span>
          <span className="font-black text-xl text-amber-600">{coins}</span>
        </div>
        <div className="bg-white/90 rounded-2xl px-5 py-3 flex items-center gap-2 shadow-lg">
          <span className="text-2xl">💎</span>
          <span className="font-black text-xl text-blue-600">{diamonds}</span>
        </div>
      </div>
    </div>
  );
}
