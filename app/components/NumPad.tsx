"use client";

interface Props {
  onInput: (v: string) => void;
  disabled?: boolean;
  /** mushikuiモード: 0も使える・複数桁 */
  multiDigit?: boolean;
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "del", "0", "ok"];

export default function NumPad({ onInput, disabled, multiDigit }: Props) {
  return (
    <div className="grid grid-cols-3 gap-3 w-full max-w-xs mx-auto">
      {KEYS.map(k => {
        const isDel = k === "del";
        const isOk  = k === "ok";
        const isZero = k === "0";
        // In single-digit mode, 0 is dimmed (not useful but not hidden)
        const dimmed = !multiDigit && isZero;

        return (
          <button
            key={k}
            onClick={() => !disabled && onInput(k)}
            disabled={disabled}
            className={[
              "flex items-center justify-center rounded-2xl font-black text-2xl",
              "aspect-[1.15] shadow-[0_4px_0_rgba(0,0,0,0.15)]",
              "active:translate-y-1 active:shadow-[0_1px_0_rgba(0,0,0,0.15)]",
              "transition-transform select-none",
              isDel
                ? "bg-red-100 text-red-500 border-2 border-red-200 hover:bg-red-200"
                : isOk
                ? "bg-gradient-to-br from-green-400 to-green-600 text-white shadow-[0_4px_0_#15803d]"
                : dimmed
                ? "bg-gray-100 text-gray-400 border-2 border-gray-200"
                : "bg-white text-gray-800 border-2 border-gray-200 hover:bg-indigo-50 hover:border-indigo-300",
              disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer",
            ].join(" ")}
          >
            {isDel ? "⌫" : isOk ? "✓" : k}
          </button>
        );
      })}
    </div>
  );
}
