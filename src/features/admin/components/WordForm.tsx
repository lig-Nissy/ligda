"use client";

import { useState } from "react";
import { Word, Category, DifficultyWeights, DEFAULT_WEIGHTS, InputType } from "@/types";

interface WordFormProps {
  word?: Word | null;
  categories: Category[];
  onSave: (data: {
    text: string;
    reading: string;
    inputType: InputType;
    categoryId: string;
    weights: DifficultyWeights;
  }) => void;
  onCancel: () => void;
}

export function WordForm({ word, categories, onSave, onCancel }: WordFormProps) {
  const [text, setText] = useState(word?.text ?? "");
  const [reading, setReading] = useState(word?.reading ?? "");
  const [inputType, setInputType] = useState<InputType>(word?.inputType ?? "hiragana");
  const [categoryId, setCategoryId] = useState(word?.categoryId ?? "default");
  const [weights, setWeights] = useState<DifficultyWeights>(
    word?.weights ? { ...word.weights } : { ...DEFAULT_WEIGHTS }
  );

  const handleWeightChange = (difficulty: keyof DifficultyWeights, value: number) => {
    setWeights((prev) => ({
      ...prev,
      [difficulty]: Math.max(0, Math.min(10, value)),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !reading.trim()) {
      alert("テキストとふりがなは必須です");
      return;
    }
    onSave({ text: text.trim(), reading: reading.trim(), inputType, categoryId, weights });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          テキスト（表示される言葉）
        </label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="例: 寿司"
          className="w-full p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100"
        />
      </div>

      {/* 入力タイプ選択 */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          入力タイプ
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="inputType"
              value="hiragana"
              checked={inputType === "hiragana"}
              onChange={() => setInputType("hiragana")}
              className="w-4 h-4 text-orange-500"
            />
            <span className="text-zinc-700 dark:text-zinc-300">ひらがな</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="inputType"
              value="alphabet"
              checked={inputType === "alphabet"}
              onChange={() => setInputType("alphabet")}
              className="w-4 h-4 text-orange-500"
            />
            <span className="text-zinc-700 dark:text-zinc-300">アルファベット</span>
          </label>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          ひらがな: 日本語をローマ字入力 / アルファベット: 英単語をそのまま入力
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          {inputType === "hiragana" ? "ふりがな（ひらがな）" : "入力テキスト（アルファベット）"}
        </label>
        <input
          type="text"
          value={reading}
          onChange={(e) => setReading(e.target.value)}
          placeholder={inputType === "hiragana" ? "例: すし" : "例: container"}
          className="w-full p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100"
        />
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          {inputType === "hiragana"
            ? "※ひらがなで入力してください"
            : "※小文字のアルファベットで入力してください"}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          カテゴリ
        </label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100"
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* 難易度別の重み設定 */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          難易度別の重み（出現頻度）
        </label>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
          0〜10で設定。数値が大きいほど出現しやすくなります。0の場合はその難易度では出現しません。
        </p>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
            <label className="block text-sm font-medium text-green-700 dark:text-green-400 mb-1">
              かんたん
            </label>
            <input
              type="number"
              min="0"
              max="10"
              value={weights.easy}
              onChange={(e) => handleWeightChange("easy", parseInt(e.target.value) || 0)}
              className="w-full p-2 rounded border border-green-200 dark:border-green-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 text-center"
            />
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
            <label className="block text-sm font-medium text-yellow-700 dark:text-yellow-400 mb-1">
              ふつう
            </label>
            <input
              type="number"
              min="0"
              max="10"
              value={weights.normal}
              onChange={(e) => handleWeightChange("normal", parseInt(e.target.value) || 0)}
              className="w-full p-2 rounded border border-yellow-200 dark:border-yellow-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 text-center"
            />
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
            <label className="block text-sm font-medium text-red-700 dark:text-red-400 mb-1">
              むずかしい
            </label>
            <input
              type="number"
              min="0"
              max="10"
              value={weights.hard}
              onChange={(e) => handleWeightChange("hard", parseInt(e.target.value) || 0)}
              className="w-full p-2 rounded border border-red-200 dark:border-red-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 text-center"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 px-4 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
        >
          キャンセル
        </button>
        <button
          type="submit"
          className="flex-1 py-3 px-4 rounded-lg bg-orange-500 text-white hover:bg-orange-600"
        >
          {word ? "更新" : "追加"}
        </button>
      </div>
    </form>
  );
}
