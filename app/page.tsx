"use client";
import { useState } from "react";
import type { AppScreen, GameConfig, GameResult, ChallengeType, PracticeMode, SaveData } from "./lib/types";
import { loadSave, writeSave } from "./lib/storage";
import TitleScreen     from "./components/TitleScreen";
import PracticeSelect  from "./components/PracticeSelect";
import ChallengeSelect from "./components/ChallengeSelect";
import GameScreen      from "./components/GameScreen";
import ResultScreen    from "./components/ResultScreen";

export default function Home() {
  const [screen,     setScreen]     = useState<AppScreen>("title");
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [saveData,   setSaveData]   = useState<SaveData>(() => loadSave());

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
    // Update saveData
    const next: SaveData = {
      ...saveData,
      coins:    saveData.coins + result.coinsEarned,
      diamonds: saveData.diamonds + (result.stars === 3 ? 1 : 0),
      practiceStars:    { ...saveData.practiceStars },
      challengeStars:   { ...saveData.challengeStars },
      challengeUnlocked:{ ...saveData.challengeUnlocked },
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
    }

    writeSave(next);
    setSaveData(next);
    setGameResult(result);
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
          onPractice={() => setScreen("practiceSelect")}
          onChallenge={() => setScreen("challengeSelect")}
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
          onRetry={handleRetry}
          onBack={handleBack}
        />
      )}
    </>
  );
}
