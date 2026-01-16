"use client";

import { useState, useEffect, startTransition, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Difficulty, RankingEntry } from "@/types";
import { getRankingByDifficulty } from "@/libs/ranking";

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "かんたん",
  normal: "ふつう",
  hard: "むずかしい",
};

function RankingContent() {
  const searchParams = useSearchParams();
  const initialDifficulty = (searchParams.get("difficulty") as Difficulty) || "normal";

  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(initialDifficulty);
  const [ranking, setRanking] = useState<RankingEntry[]>([]);

  useEffect(() => {
    startTransition(() => {
      setRanking(getRankingByDifficulty(selectedDifficulty));
    });
  }, [selectedDifficulty]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
              ランキング
            </h1>
            <Link
              href="/"
              className="text-orange-500 hover:text-orange-600 text-sm font-medium"
            >
              ← トップへ戻る
            </Link>
          </div>

          {/* 難易度タブ */}
          <div className="flex gap-1 mb-6">
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
            <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
              まだ記録がありません
            </div>
          ) : (
            <div className="space-y-2">
              {ranking.map((entry, index) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800"
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

          {/* 件数表示 */}
          {ranking.length > 0 && (
            <div className="text-center mt-6 text-sm text-zinc-500 dark:text-zinc-400">
              全{ranking.length}件
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RankingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-500">読み込み中...</div>
      </div>
    }>
      <RankingContent />
    </Suspense>
  );
}
