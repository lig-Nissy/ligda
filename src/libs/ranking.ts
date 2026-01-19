import { RankingEntry, Difficulty } from "@/types";

const NICKNAME_KEY = "typing_game_nickname";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

// 難易度別ランキング取得（API経由）
export async function getRankingByDifficulty(
  difficulty: Difficulty
): Promise<RankingEntry[]> {
  const res = await fetch(`/api/ranking?difficulty=${difficulty}`);
  if (!res.ok) return [];
  return res.json();
}

// ランキングに追加（API経由）
export async function addRankingEntry(
  entry: Omit<RankingEntry, "id" | "createdAt">
): Promise<RankingEntry> {
  const res = await fetch("/api/ranking", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  });
  return res.json();
}

// ランキング内の順位を取得
export async function getRank(
  score: number,
  difficulty: Difficulty
): Promise<number> {
  const ranking = await getRankingByDifficulty(difficulty);
  const rank = ranking.findIndex((entry) => score > entry.score);
  return rank === -1 ? ranking.length + 1 : rank + 1;
}

// トップ10を取得
export async function getTopRanking(
  difficulty: Difficulty,
  limit = 10
): Promise<RankingEntry[]> {
  const res = await fetch(`/api/ranking?difficulty=${difficulty}&limit=${limit}`);
  if (!res.ok) return [];
  return res.json();
}

// ニックネーム取得（localStorageのまま）
export function getSavedNickname(): string {
  if (!isBrowser()) return "";
  return localStorage.getItem(NICKNAME_KEY) || "";
}

// ニックネーム保存（localStorageのまま）
export function saveNickname(nickname: string): void {
  if (!isBrowser()) return;
  localStorage.setItem(NICKNAME_KEY, nickname);
}

// ランキング件数取得（API経由）
export async function getRankingCount(): Promise<number> {
  const res = await fetch("/api/ranking/count");
  if (!res.ok) return 0;
  const data = await res.json();
  return data.count;
}

// ランキングをリセット（全削除）（API経由）
export async function clearRanking(): Promise<void> {
  await fetch("/api/ranking/clear", { method: "DELETE" });
}
