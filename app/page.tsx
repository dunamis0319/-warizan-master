"use client";
import { useState } from "react";
import type { AppScreen, GameConfig, GameResult, ChallengeType, PracticeMode, SaveData } from "./lib/types";
import { loadSave, writeSave } from "./lib/storage";
import { calcLevel } from "./lib/level";
import TitleScreen     from "./components/TitleScreen";
import PracticeSelect  from "./components/PracticeSelect";
import ChallengeSelect from "./components/ChallengeSelect";
import GameScreen      from "./components/GameScreen";
import ResultScreen    from "./components/ResultScreen";
import EndingScreen    from "./components/EndingScreen";
import SettingsScreen  from "./components/SettingsScreen";

// 全6種×5ランク = 30チャレンジをすべてクリアしたか判定
const ALL_CHALLENGE_TYPES: ChallengeType[] = [
  "normal", "timeattack", "mazekaze", "block", "mushikui", "answer-first",
];
function checkAllClear(challengeStars: Record<string, number>): boolean {
  return ALL_CHALLENGE_TYPES.every(type =>
    [1, 2, 3, 4, 5].every(rank => (challengeStars[`${type}_${rank}`] ?? 0) > 0)
  );
}

function loadSoundEnabled(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem("warizan-sound") !== "false";
}

export default function Home() {
  const [screen,       setScreen]       = useState<AppScreen>("title");
  const [gameConfig,   setGameConfig]   = useState<GameConfig | null>(null);
  const [gameResult,   setGameResult]   = useState<GameResult | null>(null);
  const [saveData,     setSaveData]     = useState<SaveData>(() => loadSave());
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(loadSoundEnabled);
  const [levelUpData,  setLevelUpData]  = useState<{ prevLevel: number; newLevel: number } | null>(null);

  // ---- Navigation helpers ----

  function startPractice(dan: number, mode: PracticeMode) {
    setGameConfig({ kind: "practice", dan, mode });
    setGameResult(null);
    setScreen("game");
  }

  function startChallenge(challengeType: ChallengeType, rank: number) {
    setGameConfig({ kind: "challenge", challengeType, rank });
    setGameResult(null);
    setScreen("game");
  }

  function handleGameFinish(result: GameResult) {
    const prevLevel = saveData.level;
    const newCoins = saveData.coins + result.coinsEarned;
    const newLevel = calcLevel(newCoins);
    const next: SaveData = {
      ...saveData,
      coins:    newCoins,
      diamonds: saveData.diamonds + (result.stars === 3 ? 1 : 0),
      level:    newLevel,
      practiceStars:     { ...saveData.practiceStars },
      challengeStars:    { ...saveData.challengeStars },
      challengeUnlocked: { ...saveData.challengeUnlocked },
    };

    if (result.config.kind === "practice") {
      const key = `${result.config.dan}_${result.config.mode}`;
      next.practiceStars[key] = Math.max(next.practiceStars[key] ?? 0, result.stars);
    } else {
      const { challengeType, rank } = result.config;
      const key = `${challengeType}_${rank}`;
      next.challengeStars[key] = Math.max(next.challengeStars[key] ?? 0, result.stars);
      // Unlock next rank on any clear
      if (result.stars > 0 && rank < 5) {
        next.challengeUnlocked[`${challengeType}_${rank + 1}`] = true;
      }
      // 全クリア判定（初めてのとき）
      if (!saveData.allClear && checkAllClear(next.challengeStars)) {
        next.allClear = true;
        writeSave(next);
        setSaveData(next);
        setScreen("ending");
        return;
      }
    }

    writeSave(next);
    setSaveData(next);
    setGameResult(result);

    // レベルアップ検出
    if (newLevel > prevLevel) {
      setLevelUpData({ prevLevel, newLevel });
    }

    setScreen("result");
  }

  function handleRetry() {
    if (!gameConfig) return;
    setGameResult(null);
    setScreen("game");
  }

  function handleBack() {
    if (!gameResult) { setScreen("title"); return; }
    setScreen(gameResult.config.kind === "practice" ? "practiceSelect" : "challengeSelect");
  }

  function handleToggleSound() {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem("warizan-sound", next ? "true" : "false");
  }

  function handleResetData() {
    localStorage.removeItem("warizan-master-v2");
    setSaveData(loadSave());
    setShowSettings(false);
    setScreen("title");
  }

  // key ensures GameScreen remounts for each new game
  const gameKey = gameConfig
    ? JSON.stringify(gameConfig) + screen
    : "none";

  return (
    <>
      {screen === "title" && (
        <TitleScreen
          coins={saveData.coins}
          diamonds={saveData.diamonds}
          level={saveData.level}
          allClear={saveData.allClear}
          onPractice={() => setScreen("practiceSelect")}
          onChallenge={() => setScreen("challengeSelect")}
          onSettings={() => setShowSettings(true)}
        />
      )}

      {screen === "practiceSelect" && (
        <PracticeSelect
          saveData={saveData}
          onSelect={startPractice}
          onBack={() => setScreen("title")}
        />
      )}

      {screen === "challengeSelect" && (
        <ChallengeSelect
          saveData={saveData}
          onSelect={startChallenge}
          onBack={() => setScreen("title")}
        />
      )}

      {screen === "game" && gameConfig && (
        <GameScreen
          key={gameKey}
          config={gameConfig}
          onFinish={handleGameFinish}
          onExit={() => setScreen(gameConfig.kind === "practice" ? "practiceSelect" : "challengeSelect")}
        />
      )}

      {screen === "result" && gameResult && (
        <ResultScreen
          result={gameResult}
          levelUpData={levelUpData}
          onRetry={handleRetry}
          onBack={() => { setLevelUpData(null); handleBack(); }}
        />
      )}

      {screen === "ending" && (
        <EndingScreen
          saveData={saveData}
          onPlayAgain={() => setScreen("challengeSelect")}
          onTitle={() => setScreen("title")}
        />
      )}

      {/* 設定モーダル（どの画面でも開ける） */}
      {showSettings && (
        <SettingsScreen
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          onClose={() => setShowSettings(false)}
          onResetData={handleResetData}
          onTitle={() => { setShowSettings(false); setScreen("title"); }}
        />
      )}
    </>
  );
}
