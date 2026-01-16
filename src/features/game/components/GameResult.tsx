"use client";

import { useState, useEffect, startTransition } from "react";
import { GameResult as GameResultType, Difficulty } from "@/types";
import { addRankingEntry, getRank } from "@/libs/ranking";
import { Ranking } from "./Ranking";

interface GameResultProps {
  result: GameResultType;
  difficulty: Difficulty;
  nickname: string;
  onRestart: () => void;
  onBack: () => void;
}

export function GameResult({ result, difficulty, nickname, onRestart, onBack }: GameResultProps) {
  const [savedEntryId, setSavedEntryId] = useState<string | null>(null);
  const [rank, setRank] = useState<number | null>(null);

  // 初回レンダー時にランキングに保存
  useEffect(() => {
    const entry = addRankingEntry({
      nickname,
      score: result.score,
      difficulty,
      accuracy: result.accuracy,
      wordsPerMinute: result.wordsPerMinute,
      totalWords: result.totalWords,
    });
    startTransition(() => {
      setSavedEntryId(entry.id);
      setRank(getRank(result.score, difficulty));
    });
  }, [nickname, result, difficulty]);
  return (
    <div className="flex flex-col items-center gap-8 p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg max-w-md w-full">
      <h2 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">
        結果発表
      </h2>

      <div className="text-6xl font-bold text-orange-500">{result.score}</div>
      <div className="text-zinc-500 dark:text-zinc-400">スコア</div>

      {/* 順位表示 */}
      {rank !== null && (
        <div className="flex items-center gap-2">
          <span className="text-zinc-600 dark:text-zinc-400">{nickname} さんは</span>
          <span className={`text-2xl font-bold ${rank <= 3 ? "text-yellow-500" : "text-orange-500"}`}>
            {rank}位
          </span>
        </div>
      )}

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

      {/* ランキング */}
      <Ranking difficulty={difficulty} highlightEntryId={savedEntryId ?? undefined} />

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
