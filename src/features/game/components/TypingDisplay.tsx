"use client";

import { Word } from "@/types";

interface TypingDisplayProps {
  word: Word;
  typed: string;
  remaining: string;
}

export function TypingDisplay({ word, typed, remaining }: TypingDisplayProps) {
  return (
    <div className="flex flex-col items-center gap-4 p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg">
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
