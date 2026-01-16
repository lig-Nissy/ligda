"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { Word, Category, DifficultyWeights, InputType } from "@/types";
import {
  getWords,
  addWord,
  updateWord,
  deleteWord,
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from "@/libs/storage";
import { WordList } from "./WordList";
import { WordForm } from "./WordForm";
import { CategoryList } from "./CategoryList";
import { CategoryForm } from "./CategoryForm";
import { CsvUpload } from "./CsvUpload";

type Tab = "words" | "categories" | "import";

export function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("words");
  const [words, setWords] = useState<Word[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showWordForm, setShowWordForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  // データ読み込み
  useEffect(() => {
    setWords(getWords());
    setCategories(getCategories());
  }, []);

  // ワード操作
  const handleSaveWord = (data: {
    text: string;
    reading: string;
    inputType: InputType;
    categoryId: string;
    weights: DifficultyWeights;
  }) => {
    if (editingWord) {
      updateWord(editingWord.id, data);
    } else {
      addWord(data);
    }
    setWords(getWords());
    setShowWordForm(false);
    setEditingWord(null);
  };

  const handleEditWord = (word: Word) => {
    setEditingWord(word);
    setShowWordForm(true);
  };

  const handleDeleteWord = (id: string) => {
    deleteWord(id);
    setWords(getWords());
  };

  const handleBulkDeleteWords = (ids: string[]) => {
    for (const id of ids) {
      deleteWord(id);
    }
    setWords(getWords());
  };

  // カテゴリ操作
  const handleSaveCategory = (data: { name: string; description: string }) => {
    if (editingCategory) {
      updateCategory(editingCategory.id, data);
    } else {
      addCategory(data);
    }
    setCategories(getCategories());
    setShowCategoryForm(false);
    setEditingCategory(null);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowCategoryForm(true);
  };

  const handleDeleteCategory = (id: string) => {
    deleteCategory(id);
    setCategories(getCategories());
    setWords(getWords()); // ワードのカテゴリも更新される可能性
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* ヘッダー */}
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">
            管理画面
          </h1>
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="text-orange-500 hover:text-orange-600 text-sm"
            >
              ゲームへ戻る
            </a>
            <button
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 text-sm"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      {/* タブ */}
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <div className="flex gap-2 border-b border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setTab("words")}
            className={`px-4 py-2 font-medium -mb-px ${
              tab === "words"
                ? "text-orange-500 border-b-2 border-orange-500"
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            ワード管理
          </button>
          <button
            onClick={() => setTab("categories")}
            className={`px-4 py-2 font-medium -mb-px ${
              tab === "categories"
                ? "text-orange-500 border-b-2 border-orange-500"
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            カテゴリ管理
          </button>
          <button
            onClick={() => setTab("import")}
            className={`px-4 py-2 font-medium -mb-px ${
              tab === "import"
                ? "text-orange-500 border-b-2 border-orange-500"
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            CSVインポート
          </button>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {tab === "words" && (
          <div className="space-y-6">
            {showWordForm ? (
              <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow">
                <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 mb-4">
                  {editingWord ? "ワードを編集" : "ワードを追加"}
                </h2>
                <WordForm
                  word={editingWord}
                  categories={categories}
                  onSave={handleSaveWord}
                  onCancel={() => {
                    setShowWordForm(false);
                    setEditingWord(null);
                  }}
                />
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <p className="text-zinc-600 dark:text-zinc-400">
                    {words.length}件のワード
                  </p>
                  <button
                    onClick={() => setShowWordForm(true)}
                    className="px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600"
                  >
                    ワードを追加
                  </button>
                </div>
                <div className="bg-white dark:bg-zinc-900 rounded-lg shadow">
                  <WordList
                    words={words}
                    categories={categories}
                    onEdit={handleEditWord}
                    onDelete={handleDeleteWord}
                    onBulkDelete={handleBulkDeleteWords}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {tab === "categories" && (
          <div className="space-y-6">
            {showCategoryForm ? (
              <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow">
                <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 mb-4">
                  {editingCategory ? "カテゴリを編集" : "カテゴリを追加"}
                </h2>
                <CategoryForm
                  category={editingCategory}
                  onSave={handleSaveCategory}
                  onCancel={() => {
                    setShowCategoryForm(false);
                    setEditingCategory(null);
                  }}
                />
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <p className="text-zinc-600 dark:text-zinc-400">
                    {categories.length}件のカテゴリ
                  </p>
                  <button
                    onClick={() => setShowCategoryForm(true)}
                    className="px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600"
                  >
                    カテゴリを追加
                  </button>
                </div>
                <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 shadow">
                  <CategoryList
                    categories={categories}
                    onEdit={handleEditCategory}
                    onDelete={handleDeleteCategory}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {tab === "import" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow">
              <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 mb-4">
                CSVからワードをインポート
              </h2>
              <CsvUpload
                categories={categories}
                onImportComplete={() => {
                  setWords(getWords());
                  setTab("words");
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
