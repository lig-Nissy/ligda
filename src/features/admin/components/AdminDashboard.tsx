"use client";

import { useState, useEffect, startTransition } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Word, Category, Member, DifficultyWeights, InputType } from "@/types";
import {
  getWords,
  addWord,
  updateWord,
  deleteWord,
  bulkDeleteWords,
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  getMembers,
  addMember,
  updateMember,
  deleteMember,
} from "@/libs/storage";
import { getRankingCount, clearRanking, getLigRankingCount, clearLigRanking } from "@/libs/ranking";
import { WordList } from "./WordList";
import { WordForm } from "./WordForm";
import { CategoryList } from "./CategoryList";
import { CategoryForm } from "./CategoryForm";
import { CsvUpload } from "./CsvUpload";
import { MemberList } from "./MemberList";
import { MemberForm } from "./MemberForm";

type Tab = "words" | "categories" | "import" | "ranking" | "members";

export function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("words");
  const [words, setWords] = useState<Word[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const [members, setMembers] = useState<Member[]>([]);
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [showWordForm, setShowWordForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [rankingCount, setRankingCount] = useState(0);
  const [ligRankingCount, setLigRankingCount] = useState(0);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showLigResetConfirm, setShowLigResetConfirm] = useState(false);

  // クライアントサイドでのみデータを読み込む
  useEffect(() => {
    const loadData = async () => {
      const [wordsData, categoriesData, count, ligCount, membersData] = await Promise.all([
        getWords(),
        getCategories(),
        getRankingCount(),
        getLigRankingCount(),
        getMembers(),
      ]);
      startTransition(() => {
        setWords(wordsData);
        setCategories(categoriesData);
        setRankingCount(count);
        setLigRankingCount(ligCount);
        setMembers(membersData);
        setIsLoaded(true);
      });
    };
    loadData();
  }, []);

  // ワード操作
  const handleSaveWord = async (data: {
    text: string;
    reading: string;
    inputType: InputType;
    categoryId: string;
    weights: DifficultyWeights;
  }) => {
    if (editingWord) {
      await updateWord(editingWord.id, data);
    } else {
      await addWord(data);
    }
    const wordsData = await getWords();
    setWords(wordsData);
    setShowWordForm(false);
    setEditingWord(null);
  };

  const handleEditWord = (word: Word) => {
    setEditingWord(word);
    setShowWordForm(true);
  };

  const handleDeleteWord = async (id: string) => {
    await deleteWord(id);
    const wordsData = await getWords();
    setWords(wordsData);
  };

  const handleBulkDeleteWords = async (ids: string[]) => {
    await bulkDeleteWords(ids);
    const wordsData = await getWords();
    setWords(wordsData);
  };

  // カテゴリ操作
  const handleSaveCategory = async (data: { name: string; description: string }) => {
    if (editingCategory) {
      await updateCategory(editingCategory.id, data);
    } else {
      await addCategory(data);
    }
    const categoriesData = await getCategories();
    setCategories(categoriesData);
    setShowCategoryForm(false);
    setEditingCategory(null);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowCategoryForm(true);
  };

  const handleDeleteCategory = async (id: string) => {
    await deleteCategory(id);
    const [categoriesData, wordsData] = await Promise.all([
      getCategories(),
      getWords(),
    ]);
    setCategories(categoriesData);
    setWords(wordsData);
  };

  // メンバー操作
  const handleSaveMember = async (data: {
    name: string;
    nameReading: string;
    nickname: string | null;
    nicknameReading: string | null;
    photoData: string;
  }) => {
    if (editingMember) {
      await updateMember(editingMember.id, data);
    } else {
      await addMember(data);
    }
    const membersData = await getMembers();
    setMembers(membersData);
    setShowMemberForm(false);
    setEditingMember(null);
  };

  const handleEditMember = (member: Member) => {
    setEditingMember(member);
    setShowMemberForm(true);
  };

  const handleDeleteMember = async (id: string) => {
    await deleteMember(id);
    const membersData = await getMembers();
    setMembers(membersData);
  };

  // ランキングリセット
  const handleResetRanking = async () => {
    await clearRanking();
    setRankingCount(0);
    setShowResetConfirm(false);
  };

  // LigModeランキングリセット
  const handleResetLigRanking = async () => {
    await clearLigRanking();
    setLigRankingCount(0);
    setShowLigResetConfirm(false);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-500">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* ヘッダー */}
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">
            管理画面
          </h1>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-orange-500 hover:text-orange-600 text-sm"
            >
              ゲームへ戻る
            </Link>
            <button
              onClick={() => {
                if (window.confirm("ログアウトしますか？")) {
                  signOut({ callbackUrl: "/admin/login" });
                }
              }}
              className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 text-sm"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      {/* タブ */}
      <div className="max-w-6xl mx-auto px-4 pt-6">
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
          <button
            onClick={() => setTab("members")}
            className={`px-4 py-2 font-medium -mb-px ${
              tab === "members"
                ? "text-orange-500 border-b-2 border-orange-500"
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            メンバー管理
          </button>
          <button
            onClick={() => setTab("ranking")}
            className={`px-4 py-2 font-medium -mb-px ${
              tab === "ranking"
                ? "text-orange-500 border-b-2 border-orange-500"
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            ランキング管理
          </button>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="max-w-6xl mx-auto px-4 py-6">
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
                onImportComplete={async () => {
                  const wordsData = await getWords();
                  setWords(wordsData);
                  setTab("words");
                }}
              />
            </div>
          </div>
        )}

        {tab === "members" && (
          <div className="space-y-6">
            {showMemberForm ? (
              <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow">
                <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 mb-4">
                  {editingMember ? "メンバーを編集" : "メンバーを追加"}
                </h2>
                <MemberForm
                  member={editingMember}
                  onSave={handleSaveMember}
                  onCancel={() => {
                    setShowMemberForm(false);
                    setEditingMember(null);
                  }}
                />
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <p className="text-zinc-600 dark:text-zinc-400">
                    {members.length}件のメンバー
                  </p>
                  <button
                    onClick={() => setShowMemberForm(true)}
                    className="px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600"
                  >
                    メンバーを追加
                  </button>
                </div>
                <MemberList
                  members={members}
                  onEdit={handleEditMember}
                  onDelete={handleDeleteMember}
                />
              </>
            )}
          </div>
        )}

        {tab === "ranking" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow">
              <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 mb-4">
                ランキング管理
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                現在のランキング登録数: <span className="font-bold">{rankingCount}件</span>
              </p>

              {showResetConfirm ? (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-600 dark:text-red-400 font-medium mb-4">
                    本当にランキングをリセットしますか？この操作は取り消せません。
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleResetRanking}
                      className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
                    >
                      リセットする
                    </button>
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowResetConfirm(true)}
                  disabled={rankingCount === 0}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ランキングをリセット
                </button>
              )}
            </div>

            {/* LigMode ランキング */}
            <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow">
              <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 mb-4">
                LIGMode ランキング管理
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                現在のランキング登録数: <span className="font-bold">{ligRankingCount}件</span>
              </p>

              {showLigResetConfirm ? (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-600 dark:text-red-400 font-medium mb-4">
                    本当にLIGModeランキングをリセットしますか？この操作は取り消せません。
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleResetLigRanking}
                      className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
                    >
                      リセットする
                    </button>
                    <button
                      onClick={() => setShowLigResetConfirm(false)}
                      className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowLigResetConfirm(true)}
                  disabled={ligRankingCount === 0}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  LIGModeランキングをリセット
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
