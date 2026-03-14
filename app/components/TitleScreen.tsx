"use client";
import { useMemo } from "react";
import { useSound } from "../hooks/useSound";
import { getLevelProgress } from "../lib/level";

interface Props {
  coins: number;
  diamonds: number;
  level: number;
  allClear: boolean;
  onPractice: () => void;
  onChallenge: () => void;
  onSettings: () => void;
}

// 星フィールド（宇宙背景用）
function StarField() {
  const stars = useMemo(() =>
    Array.from({ length: 70 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 0.8 + Math.random() * 2,
      dur: 1.5 + Math.random() * 3,
      delay: Math.random() * 5,
    })), []
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {stars.map(s => (
        <span
          key={s.id}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            "--dur": `${s.dur}s`,
            "--delay": `${s.delay}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

export default function TitleScreen({ coins, diamonds, level, allClear, onPractice, onChallenge, onSettings }: Props) {
  const { playClick } = useSound();
  const lp = getLevelProgress(coins);

  return (
    <div className="title-screen space-bg relative overflow-hidden">
      <StarField />

      {/* 設定ボタン（右上固定） */}
      <button
        onClick={() => { playClick(); onSettings(); }}
        className="
          absolute top-4 right-4 z-20
          w-12 h-12 sm:w-14 sm:h-14
          bg-white/15 hover:bg-white/25 active:bg-white/35
          backdrop-blur-sm border border-white/25
          rounded-full flex items-center justify-center
          text-2xl sm:text-3xl
          transition-all duration-200 shadow-lg
        "
        aria-label="せってい"
      >
        ⚙️
      </button>

      {/* ① レベルバッジ */}
      <div className="w-full max-w-xs relative z-10">
        <div className="bg-white/12 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 shadow-lg flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-yellow-400/90 text-yellow-900 font-black text-sm px-2.5 py-0.5 rounded-lg shadow-sm">
                Lv.{lp.level}
              </div>
              <span className="text-sm font-bold text-white/90 drop-shadow">{lp.title}</span>
            </div>
            {!lp.isMax && (
              <span className="text-xs text-white/50 font-bold">
                {lp.progressCoins}/{lp.neededCoins}
              </span>
            )}
          </div>
          <div className="bg-white/15 rounded-full h-3.5 overflow-hidden shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 transition-all duration-700 animate-glow-pulse"
              style={{ width: `${lp.pct}%` }}
            />
          </div>
          {lp.isMax && (
            <p className="text-xs text-center font-black text-yellow-300 drop-shadow">👑 MAX レベル達成！</p>
          )}
        </div>
      </div>

      {/* ② タイトルロゴ */}
      <div className="title-area relative z-10">
        <img
          src="/image/warizanmaster.png"
          alt="割り算マスター"
          className="title-logo"
        />
        {allClear && (
          <div className="animate-badge-pulse bg-yellow-400 border-4 border-yellow-200 rounded-2xl px-6 py-1.5 shadow-2xl mt-2">
            <p className="font-black text-base text-yellow-900 tracking-widest">⭐ ALL CLEAR ⭐</p>
          </div>
        )}
      </div>

      {/* ③ モード選択カード */}
      <div className="mode-select relative z-10">
        <button
          className="mode-card practice"
          onClick={() => { playClick(); onPractice(); }}
        >
          <div className="mode-icon">📘</div>
          <div className="mode-title">割り算れんしゅう</div>
          <div className="mode-desc">ゆっくり練習モード</div>
        </button>
        <button
          className="mode-card challenge"
          onClick={() => { playClick(); onChallenge(); }}
        >
          <div className="mode-icon">⚡</div>
          <div className="mode-title">割り算チャレンジ</div>
          <div className="mode-desc">スピードチャレンジ</div>
        </button>
      </div>

      {/* ④ コイン + ダイヤ */}
      <div className="currency-area relative z-10">
        <div className="flex-1 bg-white/12 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-lg">
          <span className="text-4xl animate-coin-spin leading-none">🪙</span>
          <div>
            <div className="font-black text-2xl text-yellow-300 leading-none">{coins.toLocaleString()}</div>
            <div className="text-xs text-white/60 font-bold mt-0.5">コイン</div>
          </div>
        </div>
        <div className="flex-1 bg-white/12 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-lg">
          <span className="text-4xl animate-diamond-sparkle leading-none">💎</span>
          <div>
            <div className="font-black text-2xl text-cyan-300 leading-none">{diamonds.toLocaleString()}</div>
            <div className="text-xs text-white/60 font-bold mt-0.5">ダイヤ</div>
          </div>
        </div>
      </div>
    </div>
  );
}
