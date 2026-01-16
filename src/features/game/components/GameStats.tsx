"use client";

interface GameStatsProps {
  timeLeft: number;
  score: number;
  correctCount: number;
  missCount: number;
  completedWords: number;
  skippedWords: number;
  combo: number;
  comboThreshold: number;
}

export function GameStats({
  timeLeft,
  score,
  correctCount,
  missCount,
  completedWords,
  skippedWords,
  combo,
  comboThreshold,
}: GameStatsProps) {
  const accuracy =
    correctCount + missCount > 0
      ? Math.round((correctCount / (correctCount + missCount)) * 100)
      : 100;

  // 次のボーナスまでの残り
  const comboProgress = combo % comboThreshold;
  const comboToNext = comboThreshold - comboProgress;

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* メインステータス */}
      <div className="flex flex-wrap justify-center gap-6 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
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
          <div className="text-sm text-zinc-500 dark:text-zinc-400">クリア</div>
          <div className="text-2xl font-bold text-blue-500">
            {completedWords}
            <span className="text-sm ml-1">語</span>
          </div>
        </div>

        <div className="text-center">
          <div className="text-sm text-zinc-500 dark:text-zinc-400">スキップ</div>
          <div className="text-2xl font-bold text-red-500">
            {skippedWords}
            <span className="text-sm ml-1">語</span>
          </div>
        </div>
      </div>

      {/* コンボ表示 */}
      <div className="flex items-center justify-center gap-3 px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-yellow-600 dark:text-yellow-400 font-medium">
            コンボ
          </span>
          <span className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
            {combo}
          </span>
        </div>
        <div className="h-4 w-px bg-yellow-300 dark:bg-yellow-700" />
        <div className="flex items-center gap-1">
          <span className="text-sm text-yellow-600/70 dark:text-yellow-400/70">
            ボーナスまで
          </span>
          <div className="flex gap-1">
            {Array.from({ length: comboThreshold }).map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i < comboProgress
                    ? "bg-yellow-500"
                    : "bg-yellow-200 dark:bg-yellow-800"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-yellow-600/70 dark:text-yellow-400/70 ml-1">
            あと{comboToNext}語
          </span>
        </div>
      </div>
    </div>
  );
}
