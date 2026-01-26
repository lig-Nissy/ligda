"use client";

import { useState, useEffect, startTransition } from "react";
import { LigRankingEntry } from "@/types";
import { getLigRanking } from "@/libs/ranking";

interface LigRankingProps {
  highlightEntryId?: string;
  limit?: number;
}

export function LigRanking({ highlightEntryId, limit = 10 }: LigRankingProps) {
  const [ranking, setRanking] = useState<LigRankingEntry[]>([]);

  useEffect(() => {
    const fetchRanking = async () => {
      const all = await getLigRanking();
      startTransition(() => {
        setRanking(all.slice(0, limit));
      });
    };
    fetchRanking();
  }, [limit]);

  return (
    <div className="w-full">
      <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 mb-3">
        ランキング
      </h3>

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

              {/* 名前と詳細 */}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-zinc-800 dark:text-zinc-100 truncate">
                  {entry.nickname}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  {entry.correctCount}人正解 / 正答率{entry.accuracy.toFixed(1)}%
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
