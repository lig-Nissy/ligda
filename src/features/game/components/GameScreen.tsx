"use client";

import { useEffect } from "react";
import { useTypingGame } from "../hooks/useTypingGame";
import { TypingDisplay } from "./TypingDisplay";
import { GameStats } from "./GameStats";
import { GameResult } from "./GameResult";
import { Difficulty } from "@/types";

interface GameScreenProps {
  difficulty: Difficulty;
  categoryId: string | null;
  nickname: string;
  onBack: () => void;
}

export function GameScreen({ difficulty, categoryId, nickname, onBack }: GameScreenProps) {
  const {
    status,
    currentWord,
    timeLeft,
    score,
    correctCount,
    missCount,
    completedWords,
    skippedWords,
    combo,
    comboThreshold,
    showBonusEffect,
    lastBonusTime,
    initGame,
    startGame,
    getResult,
    getTypingDisplay,
    getWordTimeProgress,
  } = useTypingGame(difficulty, categoryId);

  const { typed, remaining } = getTypingDisplay();
  const wordTimeProgress = getWordTimeProgress();

  // マウント時に自動でゲームを初期化
  useEffect(() => {
    if (status === "idle") {
      initGame();
    }
  }, [status, initGame]);

  // ゲーム初期化中
  if (status === "idle") {
    return (
      <div className="flex flex-col items-center gap-8">
        <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // スタート待ち
  if (status === "ready") {
    return (
      <div className="flex flex-col items-center gap-8">
        <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
          準備完了
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400">
          スペースキーを押してスタート
        </p>
        <button
          onClick={startGame}
          className="py-4 px-8 rounded-full bg-orange-500 text-white text-xl hover:bg-orange-600 transition-colors"
        >
          スタート
        </button>
      </div>
    );
  }

  // ゲーム終了
  if (status === "finished") {
    return (
      <GameResult
        result={getResult()}
        difficulty={difficulty}
        nickname={nickname}
        onRestart={initGame}
        onBack={onBack}
      />
    );
  }

  // ゲーム中
  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-2xl relative">
      {/* ボーナスエフェクト */}
      {showBonusEffect && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 animate-bounce">
          <div className="bg-yellow-400 text-yellow-900 px-6 py-3 rounded-full font-bold text-lg shadow-lg">
            +{lastBonusTime}秒 ボーナス!
          </div>
        </div>
      )}

      <GameStats
        timeLeft={timeLeft}
        score={score}
        correctCount={correctCount}
        missCount={missCount}
        completedWords={completedWords}
        skippedWords={skippedWords}
        combo={combo}
        comboThreshold={comboThreshold}
      />

      {currentWord && (
        <TypingDisplay
          word={currentWord}
          typed={typed}
          remaining={remaining}
          timeProgress={wordTimeProgress}
        />
      )}

      <p className="text-sm text-zinc-400">
        5問連続で+1秒、10問で+2秒、15問以降で+3秒ボーナス!
      </p>
    </div>
  );
}
