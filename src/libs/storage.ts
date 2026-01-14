import { Word, Category, DEFAULT_WEIGHTS, Difficulty, InputType } from "@/types";

const WORDS_KEY = "typing_game_words";
const CATEGORIES_KEY = "typing_game_categories";

// デフォルトカテゴリ
const DEFAULT_CATEGORIES: Category[] = [
  {
    id: "default",
    name: "一般",
    description: "一般的な言葉",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "it",
    name: "IT用語",
    description: "プログラミング・IT関連の用語",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// デフォルトワード
const DEFAULT_WORDS: Word[] = [
  {
    id: "1",
    text: "寿司",
    reading: "すし",
    inputType: "hiragana",
    categoryId: "default",
    weights: { easy: 2, normal: 1, hard: 0 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    text: "タイピング",
    reading: "たいぴんぐ",
    inputType: "hiragana",
    categoryId: "default",
    weights: { easy: 1, normal: 2, hard: 1 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    text: "練習",
    reading: "れんしゅう",
    inputType: "hiragana",
    categoryId: "default",
    weights: { easy: 1, normal: 1, hard: 1 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "4",
    text: "キーボード",
    reading: "きーぼーど",
    inputType: "hiragana",
    categoryId: "default",
    weights: { easy: 1, normal: 2, hard: 1 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "5",
    text: "プログラミング",
    reading: "ぷろぐらみんぐ",
    inputType: "hiragana",
    categoryId: "default",
    weights: { easy: 0, normal: 1, hard: 2 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "6",
    text: "こんにちは",
    reading: "こんにちは",
    inputType: "hiragana",
    categoryId: "default",
    weights: { easy: 2, normal: 1, hard: 0 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "7",
    text: "ありがとう",
    reading: "ありがとう",
    inputType: "hiragana",
    categoryId: "default",
    weights: { easy: 2, normal: 1, hard: 1 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "8",
    text: "日本語",
    reading: "にほんご",
    inputType: "hiragana",
    categoryId: "default",
    weights: { easy: 1, normal: 1, hard: 1 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "9",
    text: "東京",
    reading: "とうきょう",
    inputType: "hiragana",
    categoryId: "default",
    weights: { easy: 1, normal: 1, hard: 1 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "10",
    text: "富士山",
    reading: "ふじさん",
    inputType: "hiragana",
    categoryId: "default",
    weights: { easy: 1, normal: 1, hard: 1 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // IT用語（アルファベット）
  {
    id: "11",
    text: "container",
    reading: "container",
    inputType: "alphabet",
    categoryId: "it",
    weights: { easy: 0, normal: 1, hard: 2 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "12",
    text: "function",
    reading: "function",
    inputType: "alphabet",
    categoryId: "it",
    weights: { easy: 1, normal: 2, hard: 1 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "13",
    text: "variable",
    reading: "variable",
    inputType: "alphabet",
    categoryId: "it",
    weights: { easy: 1, normal: 2, hard: 1 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "14",
    text: "component",
    reading: "component",
    inputType: "alphabet",
    categoryId: "it",
    weights: { easy: 0, normal: 1, hard: 2 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "15",
    text: "interface",
    reading: "interface",
    inputType: "alphabet",
    categoryId: "it",
    weights: { easy: 0, normal: 1, hard: 2 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

// 既存データのマイグレーション
function migrateWords(words: Word[]): Word[] {
  return words.map((word) => {
    const migrated = { ...word };
    // weightsがない場合
    if (!migrated.weights) {
      migrated.weights = { ...DEFAULT_WEIGHTS };
    }
    // inputTypeがない場合（既存データはひらがな）
    if (!migrated.inputType) {
      migrated.inputType = "hiragana" as InputType;
    }
    return migrated;
  });
}

// Words
export function getWords(): Word[] {
  if (!isBrowser()) return DEFAULT_WORDS;

  const stored = localStorage.getItem(WORDS_KEY);
  if (!stored) {
    localStorage.setItem(WORDS_KEY, JSON.stringify(DEFAULT_WORDS));
    return DEFAULT_WORDS;
  }
  const words = migrateWords(JSON.parse(stored));
  // マイグレーション後のデータを保存
  localStorage.setItem(WORDS_KEY, JSON.stringify(words));
  return words;
}

export function saveWords(words: Word[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(WORDS_KEY, JSON.stringify(words));
}

export function addWord(word: Omit<Word, "id" | "createdAt" | "updatedAt">): Word {
  const words = getWords();
  const newWord: Word = {
    ...word,
    weights: word.weights || { ...DEFAULT_WEIGHTS },
    inputType: word.inputType || "hiragana",
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  words.push(newWord);
  saveWords(words);
  return newWord;
}

export function updateWord(
  id: string,
  updates: Partial<Omit<Word, "id" | "createdAt">>
): Word | null {
  const words = getWords();
  const index = words.findIndex((w) => w.id === id);
  if (index === -1) return null;

  words[index] = {
    ...words[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveWords(words);
  return words[index];
}

export function deleteWord(id: string): boolean {
  const words = getWords();
  const filtered = words.filter((w) => w.id !== id);
  if (filtered.length === words.length) return false;
  saveWords(filtered);
  return true;
}

export function getWordsByCategory(categoryId: string | null): Word[] {
  const words = getWords();
  if (!categoryId) return words;
  return words.filter((w) => w.categoryId === categoryId);
}

// 難易度別に重み付けされたワードリストを取得
export function getWeightedWordsByDifficulty(
  difficulty: Difficulty,
  categoryId: string | null
): Word[] {
  const words = getWordsByCategory(categoryId);
  const weightedWords: Word[] = [];

  for (const word of words) {
    const weight = word.weights[difficulty];
    // 重みが0より大きい場合、その回数分ワードを追加
    for (let i = 0; i < weight; i++) {
      weightedWords.push(word);
    }
  }

  // 重み0のワードしかない場合は全ワードを返す（フォールバック）
  if (weightedWords.length === 0) {
    return words;
  }

  return weightedWords;
}

// Categories
export function getCategories(): Category[] {
  if (!isBrowser()) return DEFAULT_CATEGORIES;

  const stored = localStorage.getItem(CATEGORIES_KEY);
  if (!stored) {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(DEFAULT_CATEGORIES));
    return DEFAULT_CATEGORIES;
  }
  return JSON.parse(stored);
}

export function saveCategories(categories: Category[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}

export function addCategory(
  category: Omit<Category, "id" | "createdAt" | "updatedAt">
): Category {
  const categories = getCategories();
  const newCategory: Category = {
    ...category,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  categories.push(newCategory);
  saveCategories(categories);
  return newCategory;
}

export function updateCategory(
  id: string,
  updates: Partial<Omit<Category, "id" | "createdAt">>
): Category | null {
  const categories = getCategories();
  const index = categories.findIndex((c) => c.id === id);
  if (index === -1) return null;

  categories[index] = {
    ...categories[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveCategories(categories);
  return categories[index];
}

export function deleteCategory(id: string): boolean {
  if (id === "default") return false; // デフォルトカテゴリは削除不可
  const categories = getCategories();
  const filtered = categories.filter((c) => c.id !== id);
  if (filtered.length === categories.length) return false;
  saveCategories(filtered);

  // カテゴリに属するワードをデフォルトに移動
  const words = getWords();
  const updatedWords = words.map((w) =>
    w.categoryId === id ? { ...w, categoryId: "default" } : w
  );
  saveWords(updatedWords);

  return true;
}
