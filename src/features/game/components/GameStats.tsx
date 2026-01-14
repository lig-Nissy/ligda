"use client";

interface GameStatsProps {
  timeLeft: number;
  score: number;
  correctCount: number;
  missCount: number;
  completedWords: number;
}

export function GameStats({
  timeLeft,
  score,
  correctCount,
  missCount,
  completedWords,
}: GameStatsProps) {
  const accuracy =
    correctCount + missCount > 0
      ? Math.round((correctCount / (correctCount + missCount)) * 100)
      : 100;

  return (
    <div className="flex justify-center gap-8 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
      <div className="text-center">
        <div className="text-sm text-zinc-500 dark:text-zinc-400">残り時間</div>
        <div className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
          {timeLeft}
          <span className="text-sm ml-1">秒</span>
        </div>
      </div>

      <div className="text-center">
        <div className="text-sm text-zinc-500 dark:text-zinc-400">スコア</div>
        <div className="text-2xl font-bold text-orange-500">{score}</div>
      </div>

      <div className="text-center">
        <div className="text-sm text-zinc-500 dark:text-zinc-400">正確率</div>
        <div className="text-2xl font-bold text-green-500">{accuracy}%</div>
      </div>

      <div className="text-center">
        <div className="text-sm text-zinc-500 dark:text-zinc-400">タイプ数</div>
        <div className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
          {completedWords}
          <span className="text-sm ml-1">語</span>
        </div>
      </div>
    </div>
  );
}
