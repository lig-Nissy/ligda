"use client";

import { useState, useEffect, startTransition } from "react";
import Link from "next/link";
import { Difficulty, Category } from "@/types";
import { getCategories } from "@/libs/storage";
import { getSavedNickname, saveNickname } from "@/libs/ranking";

interface GameMenuProps {
  onStart: (difficulty: Difficulty, categoryId: string | null, nickname: string) => void;
  onDifficultyChange?: (difficulty: Difficulty) => void;
}

const DIFFICULTY_LABELS: Record<Difficulty, { name: string; description: string }> = {
  easy: { name: "かんたん", description: "60秒 / ゆっくり" },
  normal: { name: "ふつう", description: "90秒 / 標準スピード" },
  hard: { name: "むずかしい", description: "120秒 / 高速" },
};

export function GameMenu({ onStart, onDifficultyChange }: GameMenuProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    startTransition(() => {
      setCategories(getCategories());
      setNickname(getSavedNickname());
    });
  }, []);

  const handleStart = () => {
    const trimmedNickname = nickname.trim() || "名無し";
    saveNickname(trimmedNickname);
    onStart(difficulty, categoryId, trimmedNickname);
  };

  return (
    <div className="flex flex-col items-center gap-8 p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg w-full">
      <h1 className="text-4xl font-bold text-zinc-800 dark:text-zinc-100">
        タイピングゲーム
      </h1>

      <div className="text-6xl">🍣</div>

      {/* ニックネーム入力 */}
      <div className="w-full">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          ニックネーム
        </label>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="名前を入力"
          maxLength={20}
          className="w-full p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100"
        />
      </div>

      {/* 難易度選択 */}
      <div className="w-full">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          難易度
        </label>
        <div className="flex flex-col gap-2">
          {(Object.keys(DIFFICULTY_LABELS) as Difficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => {
                setDifficulty(d);
                onDifficultyChange?.(d);
              }}
              className={`p-4 rounded-lg border-2 text-left transition-colors ${
                difficulty === d
                  ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                  : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
              }`}
            >
              <div className="font-bold text-zinc-800 dark:text-zinc-100">
                {DIFFICULTY_LABELS[d].name}
              </div>
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                {DIFFICULTY_LABELS[d].description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* カテゴリ選択 */}
      <div className="w-full">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          カテゴリ
        </label>
        <select
          value={categoryId || ""}
          onChange={(e) => setCategoryId(e.target.value || null)}
          className="w-full p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100"
        >
          <option value="">すべてのカテゴリ</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* スタートボタン */}
      <button
        onClick={handleStart}
        className="w-full py-4 px-8 rounded-full bg-orange-500 text-white text-xl font-bold hover:bg-orange-600 transition-colors"
      >
        スタート
      </button>

      {/* 管理画面リンク */}
      <Link
        href="/admin"
        className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 text-sm"
      >
        管理画面へ
      </Link>
    </div>
  );
}
