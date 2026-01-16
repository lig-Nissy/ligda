"use client";

import { Word } from "@/types";

interface TypingDisplayProps {
  word: Word;
  typed: string;
  remaining: string;
  timeProgress: number; // 0-1（残り時間の割合）
}

export function TypingDisplay({
  word,
  typed,
  remaining,
  timeProgress,
}: TypingDisplayProps) {
  // 残り時間に応じて色を変更
  const getProgressColor = () => {
    if (timeProgress > 0.5) return "bg-green-500";
    if (timeProgress > 0.25) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getProgressBgColor = () => {
    if (timeProgress > 0.5) return "bg-green-100 dark:bg-green-900/30";
    if (timeProgress > 0.25) return "bg-yellow-100 dark:bg-yellow-900/30";
    return "bg-red-100 dark:bg-red-900/30";
  };

  return (
    <div className="flex flex-col items-center gap-4 p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg w-full max-w-lg">
      {/* ワード制限時間プログレスバー */}
      <div className={`w-full h-2 rounded-full ${getProgressBgColor()}`}>
        <div
          className={`h-full rounded-full transition-all duration-100 ${getProgressColor()}`}
          style={{ width: `${timeProgress * 100}%` }}
        />
      </div>

      {/* 日本語表示 */}
      <div className="text-4xl font-bold text-zinc-800 dark:text-zinc-100">
        {word.text}
      </div>

      {/* ふりがな */}
      <div className="text-2xl text-zinc-500 dark:text-zinc-400">
        {word.reading}
      </div>

      {/* ローマ字表示 */}
      <div className="text-3xl font-mono tracking-wider">
        <span className="text-green-500">{typed}</span>
        <span className="text-zinc-400 dark:text-zinc-500">{remaining}</span>
      </div>
    </div>
  );
}
