"use client";

import { useTypingGame } from "../hooks/useTypingGame";
import { TypingDisplay } from "./TypingDisplay";
import { GameStats } from "./GameStats";
import { GameResult } from "./GameResult";
import { Difficulty } from "@/types";

interface GameScreenProps {
  difficulty: Difficulty;
  categoryId: string | null;
  onBack: () => void;
}

export function GameScreen({ difficulty, categoryId, onBack }: GameScreenProps) {
  const {
    status,
    currentWord,
    timeLeft,
    score,
    correctCount,
    missCount,
    completedWords,
    initGame,
    startGame,
    getResult,
    getTypingDisplay,
  } = useTypingGame(difficulty, categoryId);

  const { typed, remaining } = getTypingDisplay();

  // ゲーム未初期化
  if (status === "idle") {
    return (
      <div className="flex flex-col items-center gap-8">
        <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
          タイピングゲーム
        </h2>
        <button
          onClick={initGame}
          className="py-4 px-8 rounded-full bg-orange-500 text-white text-xl hover:bg-orange-600 transition-colors"
        >
          ゲームを準備する
        </button>
        <button
          onClick={onBack}
          className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          戻る
        </button>
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
        <div className="animate-pulse text-6xl">🍣</div>
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
      <GameResult result={getResult()} onRestart={initGame} onBack={onBack} />
    );
  }

  // ゲーム中
  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-2xl">
      <GameStats
        timeLeft={timeLeft}
        score={score}
        correctCount={correctCount}
        missCount={missCount}
        completedWords={completedWords}
      />

      {currentWord && (
        <TypingDisplay word={currentWord} typed={typed} remaining={remaining} />
      )}

      <p className="text-sm text-zinc-400">
        表示されている文字をタイピングしてください
      </p>
    </div>
  );
}
