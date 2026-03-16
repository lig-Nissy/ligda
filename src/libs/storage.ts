import { Word, Category, Difficulty, Member } from "@/types";

// Words

// ワード一覧取得（API経由）
export async function getWords(): Promise<Word[]> {
  const res = await fetch("/api/words");
  if (!res.ok) return [];
  return res.json();
}

// ワード追加（API経由）
export async function addWord(
  word: Omit<Word, "id" | "createdAt" | "updatedAt">
): Promise<Word> {
  const res = await fetch("/api/words", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(word),
  });
  return res.json();
}

// ワード更新（API経由）
export async function updateWord(
  id: string,
  updates: Partial<Omit<Word, "id" | "createdAt">>
): Promise<Word | null> {
  const res = await fetch(`/api/words/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) return null;
  return res.json();
}

// ワード削除（API経由）
export async function deleteWord(id: string): Promise<boolean> {
  const res = await fetch(`/api/words/${id}`, {
    method: "DELETE",
  });
  return res.ok;
}

// ワード一括削除（API経由）
export async function bulkDeleteWords(ids: string[]): Promise<number> {
  const res = await fetch("/api/words/bulk-delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) return 0;
  const data = await res.json();
  return data.count;
}

// カテゴリ別ワード取得（API経由）
export async function getWordsByCategory(
  categoryId: string | null
): Promise<Word[]> {
  const url = categoryId
    ? `/api/words?categoryId=${categoryId}`
    : "/api/words";
  const res = await fetch(url);
  if (!res.ok) return [];
  return res.json();
}

// 難易度別に重み付けされたワードリストを取得（API経由）
export async function getWeightedWordsByDifficulty(
  difficulty: Difficulty,
  categoryId: string | null
): Promise<Word[]> {
  const params = new URLSearchParams({
    weighted: "true",
    difficulty,
  });
  if (categoryId) {
    params.set("categoryId", categoryId);
  }
  const res = await fetch(`/api/words?${params.toString()}`);
  if (!res.ok) return [];
  return res.json();
}

// ワード一括追加（API経由）
export async function bulkAddWords(
  words: Omit<Word, "id" | "createdAt" | "updatedAt">[]
): Promise<number> {
  const res = await fetch("/api/words", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(words),
  });
  if (!res.ok) return 0;
  const data = await res.json();
  return data.count;
}

// Members

// メンバー一覧取得（API経由）
export async function getMembers(): Promise<Member[]> {
  const res = await fetch("/api/members");
  if (!res.ok) return [];
  return res.json();
}

// メンバー追加（API経由）
export async function addMember(
  member: Omit<Member, "id" | "createdAt" | "updatedAt">
): Promise<Member> {
  const res = await fetch("/api/members", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(member),
  });
  return res.json();
}

// メンバー更新（API経由）
export async function updateMember(
  id: string,
  updates: Partial<Omit<Member, "id" | "createdAt">>
): Promise<Member | null> {
  const res = await fetch(`/api/members/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) return null;
  return res.json();
}

// メンバー削除（API経由）
export async function deleteMember(id: string): Promise<boolean> {
  const res = await fetch(`/api/members/${id}`, {
    method: "DELETE",
  });
  return res.ok;
}

// Categories

// カテゴリ一覧取得（API経由）
export async function getCategories(): Promise<Category[]> {
  const res = await fetch("/api/categories");
  if (!res.ok) return [];
  return res.json();
}

// カテゴリ追加（API経由）
export async function addCategory(
  category: Omit<Category, "id" | "createdAt" | "updatedAt">
): Promise<Category> {
  const res = await fetch("/api/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(category),
  });
  return res.json();
}

// カテゴリ更新（API経由）
export async function updateCategory(
  id: string,
  updates: Partial<Omit<Category, "id" | "createdAt">>
): Promise<Category | null> {
  const res = await fetch(`/api/categories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) return null;
  return res.json();
}

// カテゴリ削除（API経由）
export async function deleteCategory(id: string): Promise<boolean> {
  const res = await fetch(`/api/categories/${id}`, {
    method: "DELETE",
  });
  return res.ok;
}
