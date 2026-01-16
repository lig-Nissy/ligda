"use client";

import { useState, useEffect, startTransition } from "react";
import { Difficulty, RankingEntry } from "@/types";
import { getTopRanking } from "@/libs/ranking";

interface RankingProps {
  difficulty: Difficulty;
  highlightEntryId?: string;
}

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "かんたん",
  normal: "ふつう",
  hard: "むずかしい",
};

export function Ranking({ difficulty, highlightEntryId }: RankingProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(difficulty);
  const [ranking, setRanking] = useState<RankingEntry[]>([]);

  useEffect(() => {
    startTransition(() => {
      setRanking(getTopRanking(selectedDifficulty, 10));
    });
  }, [selectedDifficulty]);

  return (
    <div className="w-full">
      <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 mb-3">
        ランキング
      </h3>

      {/* 難易度タブ */}
      <div className="flex gap-1 mb-4">
        {(Object.keys(DIFFICULTY_LABELS) as Difficulty[]).map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDifficulty(d)}
            className={`flex-1 py-2 px-2 text-sm rounded-lg transition-colors whitespace-nowrap ${
              selectedDifficulty === d
                ? "bg-orange-500 text-white"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            {DIFFICULTY_LABELS[d]}
          </button>
        ))}
      </div>

      {/* ランキングリスト */}
      {ranking.length === 0 ? (
        <div className="text-center py-8 text-zinc-500 dark:text-zinc-400 text-sm">
          まだ記録がありません
        </div>
      ) : (
        <div className="space-y-2">
          {ranking.map((entry, index) => (
            <div
              key={entry.id}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                entry.id === highlightEntryId
                  ? "bg-orange-100 dark:bg-orange-900/30 border-2 border-orange-500"
                  : "bg-zinc-100 dark:bg-zinc-800"
              }`}
            >
              {/* 順位 */}
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${
                  index === 0
                    ? "bg-yellow-400 text-yellow-900"
                    : index === 1
                      ? "bg-zinc-300 text-zinc-700"
                      : index === 2
                        ? "bg-amber-600 text-white"
                        : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400"
                }`}
              >
                {index + 1}
              </div>

              {/* 名前とスコア */}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-zinc-800 dark:text-zinc-100 truncate">
                  {entry.nickname}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  {entry.totalWords}語 / 正確率{entry.accuracy.toFixed(1)}%
                </div>
              </div>

              {/* スコア */}
              <div className="text-right">
                <div className="font-bold text-orange-500">{entry.score}</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">pt</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
