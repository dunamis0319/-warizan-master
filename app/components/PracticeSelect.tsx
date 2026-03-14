"use client";
import type { PracticeMode, SaveData } from "../lib/types";
import { useSound } from "../hooks/useSound";

const DAN_BG = [
  "", "#EF4444","#F97316","#EAB308","#84CC16","#22C55E",
  "#14B8A6","#3B82F6","#8B5CF6","#EC4899",
];
const DAN_DARK = [
  "", "#B91C1C","#C2410C","#A16207","#4D7C0F","#15803D",
  "#0F766E","#1D4ED8","#6D28D9","#BE185D",
];

const MODES: { key: PracticeMode; label: string; desc: string }[] = [
  { key: "nobori",   label: "のぼり",   desc: "1→9" },
  { key: "kudari",   label: "くだり",   desc: "9→1" },
  { key: "barabara", label: "ばらばら", desc: "ランダム" },
];

function Stars({ count }: { count: number }) {
  return (
    <span className="flex gap-px ml-1">
      {[1, 2, 3].map(i => (
        <span key={i} className={`text-xs leading-none ${i <= count ? "text-yellow-300" : "text-white/30"}`}>
          ★
        </span>
      ))}
    </span>
  );
}

interface Props {
  saveData: SaveData;
  onSelect: (dan: number, mode: PracticeMode) => void;
  onBack: () => void;
}

export default function PracticeSelect({ saveData, onSelect, onBack }: Props) {
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
        <h1 className="font-black text-xl text-gray-800">割り算れんしゅう</h1>
        <div className="ml-auto bg-amber-100 text-amber-700 font-black rounded-xl px-3 py-1 text-xs">
          かくとくコイン ×50 🪙
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-3 gap-3 max-w-2xl mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(dan => {
            const bg = DAN_BG[dan];
            const dark = DAN_DARK[dan];
            return (
              <div
                key={dan}
                className="rounded-2xl overflow-hidden shadow-md"
                style={{ borderBottom: `4px solid ${dark}` }}
              >
                {/* Card header */}
                <div
                  className="py-2 text-center text-white font-black text-base"
                  style={{ background: bg }}
                >
                  {dan}　の　だん
                </div>

                {/* Mode buttons */}
                <div className="bg-white p-2 flex flex-col gap-1.5">
                  {MODES.map(({ key, label, desc }) => {
                    const stars = saveData.practiceStars[`${dan}_${key}`] ?? 0;
                    return (
                      <button
                        key={key}
                        onClick={() => { playClick(); onSelect(dan, key); }}
                        className="flex items-center justify-between px-2 py-2 rounded-xl text-white text-xs font-black hover:opacity-90 active:scale-95 transition-all duration-100"
                        style={{ background: bg }}
                      >
                        <span>{label}</span>
                        <span className="text-white/70 text-[10px]">{desc}</span>
                        <Stars count={stars} />
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
