"use client";

import { useState } from "react";
import { Word, Category, DEFAULT_WEIGHTS } from "@/types";

interface WordListProps {
  words: Word[];
  categories: Category[];
  onEdit: (word: Word) => void;
  onDelete: (id: string) => void;
  onBulkDelete: (ids: string[]) => void;
}

export function WordList({
  words,
  categories,
  onEdit,
  onDelete,
  onBulkDelete,
}: WordListProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || "不明";
  };

  const handleSelectAll = () => {
    if (selectedIds.size === words.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(words.map((w) => w.id)));
    }
  };

  const handleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    if (confirm(`${selectedIds.size}件のワードを削除しますか？`)) {
      onBulkDelete(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  };

  const isAllSelected = words.length > 0 && selectedIds.size === words.length;
  const isSomeSelected = selectedIds.size > 0 && selectedIds.size < words.length;

  if (words.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
        ワードが登録されていません
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      {/* 一括操作バー */}
      {selectedIds.size > 0 && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border-b border-orange-200 dark:border-orange-800 px-4 py-3 flex items-center justify-between">
          <span className="text-orange-700 dark:text-orange-400 text-sm">
            {selectedIds.size}件選択中
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-3 py-1 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
            >
              選択解除
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
            >
              選択した{selectedIds.size}件を削除
            </button>
          </div>
        </div>
      )}

      <table className="w-full">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-700">
            <th className="py-3 px-4 w-10">
              <input
                type="checkbox"
                checked={isAllSelected}
                ref={(el) => {
                  if (el) el.indeterminate = isSomeSelected;
                }}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-600 text-orange-500 focus:ring-orange-500"
              />
            </th>
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
            const isSelected = selectedIds.has(word.id);
            return (
              <tr
                key={word.id}
                className={`border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ${
                  isSelected ? "bg-orange-50 dark:bg-orange-900/10" : ""
                }`}
              >
                <td className="py-3 px-4">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSelect(word.id)}
                    className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-600 text-orange-500 focus:ring-orange-500"
                  />
                </td>
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
