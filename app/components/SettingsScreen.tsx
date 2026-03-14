"use client";
import { useState } from "react";
import { useSound } from "../hooks/useSound";

interface Props {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onClose: () => void;
  onResetData: () => void;
  onTitle: () => void;
}

export default function SettingsScreen({ soundEnabled, onToggleSound, onClose, onResetData, onTitle }: Props) {
  const { playClick } = useSound();
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)" }}
      onClick={(e) => { if (e.target === e.currentTarget) { playClick(); onClose(); } }}
    >
      <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm animate-pop">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-black text-2xl text-gray-800">⚙️ せってい</h2>
          <button
            onClick={() => { playClick(); onClose(); }}
            className="w-11 h-11 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-full flex items-center justify-center font-black text-xl transition-colors shadow-sm"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {/* Sound toggle */}
          <div className="flex items-center justify-between bg-gray-50 rounded-2xl px-5 py-4 border-2 border-gray-100">
            <div>
              <p className="font-black text-gray-800 text-base">
                {soundEnabled ? "🔊" : "🔇"} おと
              </p>
              <p className="text-xs text-gray-500 mt-0.5">サウンドエフェクト</p>
            </div>
            <button
              onClick={() => { playClick(); onToggleSound(); }}
              className={[
                "relative w-16 h-9 rounded-full transition-all duration-300 shadow-inner",
                soundEnabled ? "bg-green-400" : "bg-gray-300",
              ].join(" ")}
              aria-label="おとのオンオフ"
            >
              <span
                className={[
                  "absolute top-1.5 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300",
                  soundEnabled ? "left-9" : "left-1.5",
                ].join(" ")}
              />
            </button>
          </div>

          <div className="border-t-2 border-gray-100" />

          {/* Title button */}
          <button
            onClick={() => { playClick(); onTitle(); }}
            className="
              w-full py-4 bg-blue-500 hover:bg-blue-400
              text-white font-black text-lg rounded-2xl
              shadow-[0_5px_0_#1d4ed8]
              active:shadow-[0_2px_0_#1d4ed8] active:translate-y-0.5
              transition-all duration-100
            "
          >
            🏠 タイトルにもどる
          </button>

          {/* Reset data */}
          {!confirmReset ? (
            <button
              onClick={() => { playClick(); setConfirmReset(true); }}
              className="
                w-full py-3.5 border-2 border-red-200 bg-red-50
                text-red-500 font-bold text-base rounded-2xl
                hover:bg-red-100 transition-colors
              "
            >
              🗑️ データをけす
            </button>
          ) : (
            <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 animate-pop">
              <p className="text-red-700 font-bold text-sm text-center mb-3 leading-relaxed">
                ほんとうにけしますか？<br />
                <span className="text-xs text-red-400">（コイン・ダイヤ・クリアきろく　すべてけえます）</span>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => { playClick(); setConfirmReset(false); }}
                  className="flex-1 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={() => { playClick(); onResetData(); }}
                  className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors shadow-[0_3px_0_#b91c1c] active:translate-y-0.5 active:shadow-[0_1px_0_#b91c1c]"
                >
                  けす！
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
