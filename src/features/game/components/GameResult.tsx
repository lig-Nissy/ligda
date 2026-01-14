"use client";

import { GameResult as GameResultType } from "@/types";

interface GameResultProps {
  result: GameResultType;
  onRestart: () => void;
  onBack: () => void;
}

export function GameResult({ result, onRestart, onBack }: GameResultProps) {
  return (
    <div className="flex flex-col items-center gap-8 p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg max-w-md w-full">
      <h2 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">
        結果発表
      </h2>

      <div className="text-6xl font-bold text-orange-500">{result.score}</div>
      <div className="text-zinc-500 dark:text-zinc-400">スコア</div>

      <div className="w-full grid grid-cols-2 gap-4">
        <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 text-center">
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            タイプ数
          </div>
          <div className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
            {result.totalWords}
            <span className="text-sm ml-1">語</span>
          </div>
        </div>

        <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 text-center">
          <div className="text-sm text-zinc-500 dark:text-zinc-400">正確率</div>
          <div className="text-2xl font-bold text-green-500">
            {result.accuracy.toFixed(1)}%
          </div>
        </div>

        <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 text-center">
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            正タイプ
          </div>
          <div className="text-2xl font-bold text-green-500">
            {result.correctCount}
          </div>
        </div>

        <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 text-center">
          <div className="text-sm text-zinc-500 dark:text-zinc-400">ミス</div>
          <div className="text-2xl font-bold text-red-500">
            {result.missCount}
          </div>
        </div>

        <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 text-center col-span-2">
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            タイプ速度
          </div>
          <div className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
            {result.wordsPerMinute.toFixed(1)}
            <span className="text-sm ml-1">語/分</span>
          </div>
        </div>
      </div>

      <div className="flex gap-4 w-full">
        <button
          onClick={onBack}
          className="flex-1 py-3 px-6 rounded-full border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          メニューへ
        </button>
        <button
          onClick={onRestart}
          className="flex-1 py-3 px-6 rounded-full bg-orange-500 text-white hover:bg-orange-600 transition-colors"
        >
          もう一度
        </button>
      </div>
    </div>
  );
}
