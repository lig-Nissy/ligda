"use client";

import { Word, Category, DEFAULT_WEIGHTS } from "@/types";

interface WordListProps {
  words: Word[];
  categories: Category[];
  onEdit: (word: Word) => void;
  onDelete: (id: string) => void;
}

export function WordList({ words, categories, onEdit, onDelete }: WordListProps) {
  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || "不明";
  };

  if (words.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
        ワードが登録されていません
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-700">
            <th className="text-left py-3 px-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
              テキスト
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
              入力
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
              タイプ
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
              カテゴリ
            </th>
            <th className="text-center py-3 px-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
              重み
            </th>
            <th className="text-right py-3 px-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
              操作
            </th>
          </tr>
        </thead>
        <tbody>
          {words.map((word) => {
            const weights = word.weights || DEFAULT_WEIGHTS;
            return (
              <tr
                key={word.id}
                className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              >
                <td className="py-3 px-4 text-zinc-800 dark:text-zinc-100">
                  {word.text}
                </td>
                <td className="py-3 px-4 text-zinc-600 dark:text-zinc-300">
                  {word.reading}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      word.inputType === "alphabet"
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                        : "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
                    }`}
                  >
                    {word.inputType === "alphabet" ? "ABC" : "あ"}
                  </span>
                </td>
                <td className="py-3 px-4 text-zinc-600 dark:text-zinc-300">
                  <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-700 rounded text-sm">
                    {getCategoryName(word.categoryId)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex justify-center gap-1">
                    <span
                      className="px-2 py-0.5 text-xs rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                      title="かんたん"
                    >
                      易{weights.easy}
                    </span>
                    <span
                      className="px-2 py-0.5 text-xs rounded bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                      title="ふつう"
                    >
                      普{weights.normal}
                    </span>
                    <span
                      className="px-2 py-0.5 text-xs rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                      title="むずかしい"
                    >
                      難{weights.hard}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => onEdit(word)}
                    className="text-blue-500 hover:text-blue-600 mr-3"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`「${word.text}」を削除しますか？`)) {
                        onDelete(word.id);
                      }
                    }}
                    className="text-red-500 hover:text-red-600"
                  >
                    削除
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
