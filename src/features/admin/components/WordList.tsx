"use client";

import { useState, useMemo, useCallback } from "react";
import { Word, Category, DEFAULT_WEIGHTS } from "@/types";

type SortKey = "text" | "reading" | "inputType" | "category" | "createdAt";
type SortOrder = "asc" | "desc";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterInputType, setFilterInputType] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const getCategoryName = useCallback(
    (categoryId: string) => {
      const category = categories.find((c) => c.id === categoryId);
      return category?.name || "不明";
    },
    [categories]
  );

  // フィルタリング・ソート処理
  const filteredAndSortedWords = useMemo(() => {
    let result = [...words];

    // 検索フィルタ
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (w) =>
          w.text.toLowerCase().includes(query) ||
          w.reading.toLowerCase().includes(query)
      );
    }

    // カテゴリフィルタ
    if (filterCategory !== "all") {
      result = result.filter((w) => w.categoryId === filterCategory);
    }

    // 入力タイプフィルタ
    if (filterInputType !== "all") {
      result = result.filter((w) => w.inputType === filterInputType);
    }

    // ソート
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortKey) {
        case "text":
          comparison = a.text.localeCompare(b.text, "ja");
          break;
        case "reading":
          comparison = a.reading.localeCompare(b.reading, "ja");
          break;
        case "inputType":
          comparison = a.inputType.localeCompare(b.inputType);
          break;
        case "category":
          comparison = getCategoryName(a.categoryId).localeCompare(
            getCategoryName(b.categoryId),
            "ja"
          );
          break;
        case "createdAt":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [words, searchQuery, filterCategory, filterInputType, sortKey, sortOrder, getCategoryName]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

const renderSortIcon = (columnKey: SortKey, sortKey: SortKey, sortOrder: SortOrder) => {
    if (sortKey !== columnKey) {
      return <span className="text-zinc-300 dark:text-zinc-600 ml-1">↕</span>;
    }
    return (
      <span className="text-orange-500 ml-1">
        {sortOrder === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredAndSortedWords.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAndSortedWords.map((w) => w.id)));
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

  const clearFilters = () => {
    setSearchQuery("");
    setFilterCategory("all");
    setFilterInputType("all");
    setSortKey("createdAt");
    setSortOrder("desc");
  };

  const isAllSelected =
    filteredAndSortedWords.length > 0 &&
    selectedIds.size === filteredAndSortedWords.length;
  const isSomeSelected =
    selectedIds.size > 0 && selectedIds.size < filteredAndSortedWords.length;

  const hasActiveFilters =
    searchQuery || filterCategory !== "all" || filterInputType !== "all";

  return (
    <div>
      {/* 検索・フィルタバー */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-700 space-y-3">
        <div className="flex flex-wrap gap-3">
          {/* 検索 */}
          <div className="flex-1 min-w-50">
            <input
              type="text"
              placeholder="テキスト・ふりがなで検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 text-sm"
            />
          </div>

          {/* カテゴリフィルタ */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 text-sm"
          >
            <option value="all">全カテゴリ</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* 入力タイプフィルタ */}
          <select
            value={filterInputType}
            onChange={(e) => setFilterInputType(e.target.value)}
            className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 text-sm"
          >
            <option value="all">全タイプ</option>
            <option value="hiragana">ひらがな</option>
            <option value="alphabet">アルファベット</option>
          </select>

          {/* フィルタクリア */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              クリア
            </button>
          )}
        </div>

        {/* 結果件数 */}
        <div className="text-sm text-zinc-500 dark:text-zinc-400">
          {filteredAndSortedWords.length}件
          {hasActiveFilters && ` / ${words.length}件中`}
        </div>
      </div>

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

      {filteredAndSortedWords.length === 0 ? (
        <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
          {words.length === 0
            ? "ワードが登録されていません"
            : "条件に一致するワードがありません"}
        </div>
      ) : (
        <div className="overflow-x-auto">
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
                <th
                  className="text-left py-3 px-4 text-sm font-medium text-zinc-500 dark:text-zinc-400 cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-200"
                  onClick={() => handleSort("text")}
                >
                  テキスト
                  {renderSortIcon("text", sortKey, sortOrder)}
                </th>
                <th
                  className="text-left py-3 px-4 text-sm font-medium text-zinc-500 dark:text-zinc-400 cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-200"
                  onClick={() => handleSort("reading")}
                >
                  入力
                  {renderSortIcon("reading", sortKey, sortOrder)}
                </th>
                <th
                  className="text-left py-3 px-4 text-sm font-medium text-zinc-500 dark:text-zinc-400 cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-200"
                  onClick={() => handleSort("inputType")}
                >
                  タイプ
                  {renderSortIcon("inputType", sortKey, sortOrder)}
                </th>
                <th
                  className="text-left py-3 px-4 text-sm font-medium text-zinc-500 dark:text-zinc-400 cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-200"
                  onClick={() => handleSort("category")}
                >
                  カテゴリ
                  {renderSortIcon("category", sortKey, sortOrder)}
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
              {filteredAndSortedWords.map((word) => {
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
      )}
    </div>
  );
}
