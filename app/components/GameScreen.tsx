"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { GameConfig, Question, MistakeRecord, GameResult } from "../lib/types";
import { makePracticeQuestions, makeChallengeQuestions } from "../lib/questions";
import { useSound } from "../hooks/useSound";
import NumPad from "./NumPad";
import Fireworks from "./Fireworks";

// ---- 設定 ----

function getTimeLimit(config: GameConfig): number {
  if (config.kind === "practice") return 45;
  switch (config.challengeType) {
    case "timeattack":    return 8;
    case "mazekaze":     return 25;
    case "mushikui":     return 40;
    case "answer-first": return 20;
    case "block":        return 35;
    default:             return 30;
  }
}

function getTitle(config: GameConfig): string {
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

function calcStars(total: number, correct: number): number {
  const m = total - correct;
  if (m === 0) return 3;
  if (m <= 2)  return 2;
  return 1;
}

function calcCoins(config: GameConfig): number {
  if (config.kind === "practice") return 50;
  return config.rank * 20;
}

// ---- ブロック表示 ----

const BLOCK_COLORS = [
  "#EF4444","#F97316","#EAB308","#22C55E","#3B82F6",
  "#8B5CF6","#EC4899","#14B8A6","#F59E0B",
];

function Blocks({ count, divisor }: { count: number; divisor: number }) {
  const perRow = divisor;
  const rows = Math.ceil(count / perRow);
  return (
    <div className="flex flex-col gap-1 items-center mb-3">
      {Array.from({ length: rows }).map((_, ri) => {
        const n = Math.min(perRow, count - ri * perRow);
        return (
          <div key={ri} className="flex gap-1">
            {Array.from({ length: n }).map((_, bi) => (
              <div
                key={bi}
                className="w-6 h-6 rounded-md"
                style={{ background: BLOCK_COLORS[ri % BLOCK_COLORS.length] }}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ---- メインコンポーネント ----

interface Props {
  config: GameConfig;
  onFinish: (result: GameResult) => void;
  onExit: () => void;
}

type Phase = "question" | "correct" | "wrong";

export default function GameScreen({ config, onFinish, onExit }: Props) {
  const { playClick, playCorrect, playWrong, playClear } = useSound();

  // --- 問題リスト（初回のみ生成） ---
  const [questions] = useState<Question[]>(() =>
    config.kind === "practice"
      ? makePracticeQuestions(config.dan, config.mode)
      : makeChallengeQuestions(config.challengeType, config.rank)
  );

  const timeLimit = getTimeLimit(config);

  // --- Render state ---
  const [idx,          setIdx]          = useState(0);
  const [phase,        setPhase]        = useState<Phase>("question");
  const [inputVal,     setInputVal]     = useState("");
  const [correctCount, setCorrectCount] = useState(0);
  const [mistakes,     setMistakes]     = useState<MistakeRecord[]>([]);
  const [fireTrigger,  setFireTrigger]  = useState(0);
  const [timeLeft,     setTimeLeft]     = useState(timeLimit);

  // --- Refs for stable callbacks (avoid stale closures) ---
  const phaseRef        = useRef<Phase>("question");
  const idxRef          = useRef(0);
  const correctRef      = useRef(0);
  const mistakesRef     = useRef<MistakeRecord[]>([]);
  const questionsRef    = useRef(questions);
  const configRef       = useRef(config);
  const timerRef        = useRef<ReturnType<typeof setInterval> | null>(null);

  // sync refs with state
  phaseRef.current    = phase;
  idxRef.current      = idx;
  correctRef.current  = correctCount;
  mistakesRef.current = mistakes;

  const q = questions[idx];
  const isMushikui    = q?.displayType === "mushikui";
  const isAnswerFirst = q?.displayType === "answer-first";

  // ---- Timer: reset each question ----
  useEffect(() => {
    setTimeLeft(timeLimit);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => Math.max(0, parseFloat((t - 0.1).toFixed(1))));
    }, 100);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  // ---- Finish game ----
  const finishGame = useCallback((correct: number, miss: MistakeRecord[]) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const total = questionsRef.current.length;
    const stars  = calcStars(total, correct);
    const coins  = calcCoins(configRef.current);
    playClear();
    onFinish({ config: configRef.current, totalQuestions: total, correctCount: correct, mistakes: miss, stars, coinsEarned: coins });
  }, [playClear, onFinish]);

  // ---- Advance to next question or finish ----
  const finishRef = useRef(finishGame);
  finishRef.current = finishGame;

  const advance = useCallback((nextIdx: number, correct: number, miss: MistakeRecord[]) => {
    if (nextIdx >= questionsRef.current.length) {
      finishRef.current(correct, miss);
    } else {
      idxRef.current = nextIdx;
      phaseRef.current = "question";
      setIdx(nextIdx);
      setInputVal("");
      setPhase("question");
    }
  }, []);

  const advanceRef = useRef(advance);
  advanceRef.current = advance;

  // ---- Submit answer ----
  const submitAnswer = useCallback((rawAnswer: number) => {
    if (phaseRef.current !== "question") return;
    const q = questionsRef.current[idxRef.current];
    if (!q) return;

    const currentIdx      = idxRef.current;
    const currentCorrect  = correctRef.current;
    const currentMistakes = mistakesRef.current;

    if (rawAnswer === q.correctAnswer) {
      const newCorrect = currentCorrect + 1;
      correctRef.current  = newCorrect;
      phaseRef.current    = "correct";
      setCorrectCount(newCorrect);
      setPhase("correct");
      setFireTrigger(t => t + 1);
      playCorrect();
      setTimeout(() => advanceRef.current(currentIdx + 1, newCorrect, mistakesRef.current), 700);
    } else {
      const newMistakes = [...currentMistakes, { question: q, userAnswer: rawAnswer }];
      mistakesRef.current = newMistakes;
      phaseRef.current    = "wrong";
      setMistakes(newMistakes);
      setPhase("wrong");
      playWrong();
      setTimeout(() => advanceRef.current(currentIdx + 1, correctRef.current, mistakesRef.current), 1500);
    }
  }, [playCorrect, playWrong]);

  const submitRef = useRef(submitAnswer);
  submitRef.current = submitAnswer;

  // ---- Timer expiry → wrong ----
  useEffect(() => {
    if (timeLeft <= 0 && phaseRef.current === "question") {
      submitRef.current(-1);
    }
  }, [timeLeft]);

  // ---- Keyboard input ----
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (phaseRef.current !== "question") return;
      if (isAnswerFirst) return;

      if (isMushikui) {
        if (/^\d$/.test(e.key)) {
          setInputVal(v => (v + e.key).slice(-2));
        } else if (e.key === "Backspace") {
          setInputVal(v => v.slice(0, -1));
        } else if (e.key === "Enter") {
          setInputVal(v => {
            if (v.length > 0) submitRef.current(parseInt(v, 10));
            return v;
          });
        }
      } else {
        if (e.key >= "1" && e.key <= "9") {
          const n = parseInt(e.key, 10);
          setInputVal(e.key);
          setTimeout(() => submitRef.current(n), 80);
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isMushikui, isAnswerFirst]);

  // ---- NumPad handler ----
  function handleNumPad(v: string) {
    playClick();
    if (phaseRef.current !== "question") return;

    if (isMushikui) {
      if (v === "del") { setInputVal(i => i.slice(0, -1)); return; }
      if (v === "ok")  {
        setInputVal(i => {
          if (i.length > 0) submitRef.current(parseInt(i, 10));
          return i;
        });
        return;
      }
      if (/^\d$/.test(v)) setInputVal(i => (i + v).slice(-2));
    } else {
      if (v === "del") { setInputVal(""); return; }
      if (v === "ok")  return;
      const n = parseInt(v, 10);
      if (n >= 1 && n <= 9) {
        setInputVal(v);
        setTimeout(() => submitRef.current(n), 80);
      }
    }
  }

  // ---- Timer bar color ----
  const timePct    = (timeLeft / timeLimit) * 100;
  const timerColor = timePct < 30
    ? "from-red-500 to-orange-400"
    : timePct < 60
    ? "from-yellow-400 to-orange-400"
    : "from-green-400 to-teal-400";

  if (!q) return null;

  // ---- Wrong answer label ----
  function wrongAnswerLabel(): string {
    if (q.displayType === "answer-first") {
      const c = q.choices?.[q.correctAnswer];
      return c ? `${c.dividend}÷${c.divisor}` : "?";
    }
    return String(q.correctAnswer);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center px-4 py-4 pb-6">
      <Fireworks trigger={fireTrigger} />

      <div className="w-full max-w-md flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => { playClick(); onExit(); }}
            className="bg-gray-200 hover:bg-gray-300 w-10 h-10 rounded-full flex items-center justify-center font-black text-lg flex-shrink-0"
          >
            ✕
          </button>
          <span className="text-sm font-bold text-gray-600 flex-1 truncate">{getTitle(config)}</span>
          <span className="text-sm font-bold text-gray-500 flex-shrink-0">{idx + 1}/{questions.length}</span>
        </div>

        {/* Timer bar */}
        <div>
          <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${timerColor} transition-all duration-150`}
              style={{ width: `${timePct}%` }}
            />
          </div>
          <p className="text-right text-xs text-gray-500 font-bold mt-0.5">
            のこり {Math.ceil(timeLeft)} びょう
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex gap-1.5 flex-wrap justify-center">
          {questions.map((_, i) => {
            const hasMistake = mistakes.some(m => m.question === questions[i]);
            return (
              <div
                key={i}
                className={[
                  "w-3 h-3 rounded-full transition-all duration-300",
                  i < idx
                    ? hasMistake ? "bg-red-400" : "bg-green-400"
                    : i === idx
                    ? "bg-blue-400 scale-125"
                    : "bg-gray-200",
                ].join(" ")}
              />
            );
          })}
        </div>

        {/* Question card */}
        <div className={[
          "bg-white rounded-3xl shadow-lg p-6 text-center border-t-4",
          phase === "correct" ? "border-green-400"
            : phase === "wrong" ? "border-red-400"
            : "border-indigo-400",
        ].join(" ")}>

          {/* Block visual */}
          {q.displayType === "block" && <Blocks count={q.dividend} divisor={q.divisor} />}

          {/* Question text */}
          {q.displayType === "answer-first" ? (
            <div>
              <p className="text-sm text-gray-500 font-bold mb-2">こたえは</p>
              <div className="text-7xl font-black text-indigo-600 mb-3">{q.displayAnswer}</div>
              <p className="text-sm text-gray-500 font-bold">しきは　どれ？</p>
            </div>
          ) : q.displayType === "mushikui" ? (
            <div className="text-4xl font-black text-gray-800 tracking-widest">
              <span className={[
                "inline-block px-3 py-0.5 rounded-xl border-4",
                phase === "correct"
                  ? "border-green-400 bg-green-50 text-green-600"
                  : phase === "wrong"
                  ? "border-red-400 bg-red-50 text-red-500"
                  : inputVal
                  ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                  : "border-dashed border-gray-400 text-gray-400",
              ].join(" ")}>
                {phase === "wrong"
                  ? q.correctAnswer
                  : inputVal || "□"}
              </span>
              <span className="text-gray-400 mx-2">÷</span>
              <span className="text-red-500">{q.divisor}</span>
              <span className="text-gray-400 mx-2">=</span>
              <span className="text-indigo-500">{q.dividend / q.divisor}</span>
            </div>
          ) : (
            <div className="text-4xl sm:text-5xl font-black text-gray-800 tracking-widest">
              <span>{q.dividend}</span>
              <span className="text-gray-400 mx-2">÷</span>
              <span className="text-red-500">{q.divisor}</span>
              <span className="text-gray-400 mx-2">=</span>
              {phase === "correct" ? (
                <span className="text-green-500">{q.correctAnswer}</span>
              ) : phase === "wrong" ? (
                <span className="text-red-500">{q.correctAnswer}</span>
              ) : (
                <span className={inputVal ? "text-indigo-500" : "text-gray-300"}>
                  {inputVal || "？"}
                </span>
              )}
            </div>
          )}

          {/* Feedback */}
          <div className={[
            "mt-4 text-lg font-black min-h-7",
            phase === "correct" ? "text-green-600 animate-correct"
              : phase === "wrong" ? "text-red-500 animate-shake"
              : "text-transparent",
          ].join(" ")}>
            {phase === "correct"
              ? "🎉 せいかい！"
              : phase === "wrong"
              ? `😢 こたえは ${wrongAnswerLabel()} だよ`
              : "."}
          </div>
        </div>

        {/* Input area */}
        {isAnswerFirst ? (
          <div className="grid grid-cols-2 gap-3">
            {q.choices?.map((choice, ci) => {
              const isCorrect = ci === q.correctAnswer;
              return (
                <button
                  key={ci}
                  disabled={phase !== "question"}
                  onClick={() => { playClick(); submitAnswer(ci); }}
                  className={[
                    "py-5 rounded-2xl font-black text-xl",
                    "shadow-[0_4px_0_rgba(0,0,0,0.15)]",
                    "active:translate-y-1 active:shadow-none transition-all duration-100",
                    phase === "question"
                      ? "bg-white text-gray-800 border-2 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50"
                      : isCorrect
                      ? "bg-green-400 text-white border-2 border-green-500"
                      : "bg-gray-100 text-gray-400 border-2 border-gray-200",
                    phase !== "question" ? "cursor-not-allowed" : "",
                  ].join(" ")}
                >
                  {choice.dividend}　÷　{choice.divisor}
                </button>
              );
            })}
          </div>
        ) : (
          <NumPad
            onInput={handleNumPad}
            disabled={phase !== "question"}
            multiDigit={isMushikui}
          />
        )}
      </div>
    </div>
  );
}
