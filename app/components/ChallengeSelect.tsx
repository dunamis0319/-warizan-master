"use client";
import type { ChallengeType, SaveData } from "../lib/types";
import { useSound } from "../hooks/useSound";

interface ChallengeInfo {
  type: ChallengeType;
  label: string;
  desc: string;
  emoji: string;
  color: string;
  dark: string;
}

const CHALLENGES: ChallengeInfo[] = [
  {
    type: "normal",
    label: "ノーマル割り算",
    desc: "きほんのわり算に ちょうせん！",
    emoji: "🔢",
    color: "#3B82F6",
    dark: "#1D4ED8",
  },
  {
    type: "timeattack",
    label: "タイムアタック",
    desc: "じかんが せまってる！はやく！",
    emoji: "⏱️",
    color: "#EF4444",
    dark: "#B91C1C",
  },
  {
    type: "mazekaze",
    label: "まぜこぜ割り算",
    desc: "いろんな だんが まざるよ",
    emoji: "🎲",
    color: "#F97316",
    dark: "#C2410C",
  },
  {
    type: "block",
    label: "ブロック割り算",
    desc: "ブロックを かぞえて こたえよう",
    emoji: "🟦",
    color: "#22C55E",
    dark: "#15803D",
  },
  {
    type: "mushikui",
    label: "虫食い割り算",
    desc: "□に はいる かずを こたえよう",
    emoji: "🐛",
    color: "#8B5CF6",
    dark: "#6D28D9",
  },
  {
    type: "answer-first",
    label: "答えから割り算",
    desc: "こたえを みて しきを えらぼう",
    emoji: "🔍",
    color: "#EC4899",
    dark: "#BE185D",
  },
];

function Stars({ count }: { count: number }) {
  return (
    <span className="flex gap-px">
      {[1, 2, 3].map(i => (
        <span key={i} className={`text-[10px] leading-none ${i <= count ? "text-yellow-300" : "text-white/30"}`}>
          ★
        </span>
      ))}
    </span>
  );
}

interface Props {
  saveData: SaveData;
  onSelect: (challengeType: ChallengeType, rank: number) => void;
  onBack: () => void;
}

export default function ChallengeSelect({ saveData, onSelect, onBack }: Props) {
  const { playClick } = useSound();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 bg-white shadow-sm">
        <button
          onClick={() => { playClick(); onBack(); }}
          className="bg-gray-200 hover:bg-gray-300 w-10 h-10 rounded-full flex items-center justify-center font-black text-lg"
        >
          ←
        </button>
        <h1 className="font-black text-xl text-gray-800">割り算チャレンジ</h1>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-3 max-w-xl mx-auto">
          {CHALLENGES.map(ch => (
            <div
              key={ch.type}
              className="rounded-2xl overflow-hidden shadow-md"
              style={{ borderLeft: `5px solid ${ch.dark}` }}
            >
              {/* Card header */}
              <div
                className="flex items-center gap-3 px-4 py-3"
                style={{ background: ch.color }}
              >
                <span className="text-2xl">{ch.emoji}</span>
                <div>
                  <div className="text-white font-black text-base leading-tight">{ch.label}</div>
                  <div className="text-white/80 text-xs">{ch.desc}</div>
                </div>
              </div>

              {/* Rank buttons */}
              <div className="bg-white px-3 py-3 flex gap-2">
                {[1, 2, 3, 4, 5].map(rank => {
                  const key = `${ch.type}_${rank}`;
                  const unlocked = saveData.challengeUnlocked[key] ?? false;
                  const stars = saveData.challengeStars[key] ?? 0;

                  return (
                    <button
                      key={rank}
                      disabled={!unlocked}
                      onClick={() => { playClick(); onSelect(ch.type, rank); }}
                      className={[
                        "flex-1 flex flex-col items-center py-2 rounded-xl font-black text-sm transition-all duration-100",
                        unlocked
                          ? "text-white hover:opacity-90 active:scale-95 shadow-md"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed",
                      ].join(" ")}
                      style={unlocked ? { background: ch.color } : {}}
                    >
                      {unlocked ? (
                        <>
                          <span className="text-xs mb-0.5">R{rank}</span>
                          <Stars count={stars} />
                        </>
                      ) : (
                        <>
                          <span className="text-base">🔒</span>
                          <span className="text-[10px]">R{rank}</span>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
