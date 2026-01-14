"use client";

import { useState, useEffect } from "react";
import { Word, Category } from "@/types";

interface WordFormProps {
  word?: Word | null;
  categories: Category[];
  onSave: (data: { text: string; reading: string; categoryId: string }) => void;
  onCancel: () => void;
}

export function WordForm({ word, categories, onSave, onCancel }: WordFormProps) {
  const [text, setText] = useState("");
  const [reading, setReading] = useState("");
  const [categoryId, setCategoryId] = useState("default");

  useEffect(() => {
    if (word) {
      setText(word.text);
      setReading(word.reading);
      setCategoryId(word.categoryId);
    } else {
      setText("");
      setReading("");
      setCategoryId("default");
    }
  }, [word]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !reading.trim()) {
      alert("テキストとふりがなは必須です");
      return;
    }
    onSave({ text: text.trim(), reading: reading.trim(), categoryId });
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

      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          ふりがな（ひらがな）
        </label>
        <input
          type="text"
          value={reading}
          onChange={(e) => setReading(e.target.value)}
          placeholder="例: すし"
          className="w-full p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100"
        />
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          ※ひらがなで入力してください
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
