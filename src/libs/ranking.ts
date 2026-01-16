import { RankingEntry, Difficulty } from "@/types";

const RANKING_KEY = "typing_game_ranking";
const NICKNAME_KEY = "typing_game_nickname";
const MAX_RANKING_ENTRIES = 100;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

// ランキング取得
export function getRanking(): RankingEntry[] {
  if (!isBrowser()) return [];

  const stored = localStorage.getItem(RANKING_KEY);
  if (!stored) return [];

  return JSON.parse(stored);
}

// 難易度別ランキング取得
export function getRankingByDifficulty(difficulty: Difficulty): RankingEntry[] {
  return getRanking()
    .filter((entry) => entry.difficulty === difficulty)
    .sort((a, b) => b.score - a.score);
}

// ランキング保存
export function saveRanking(entries: RankingEntry[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(RANKING_KEY, JSON.stringify(entries));
}

// ランキングに追加
export function addRankingEntry(
  entry: Omit<RankingEntry, "id" | "createdAt">
): RankingEntry {
  const entries = getRanking();

  const newEntry: RankingEntry = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  entries.push(newEntry);

  // スコアでソートして上位のみ保持
  entries.sort((a, b) => b.score - a.score);
  const trimmed = entries.slice(0, MAX_RANKING_ENTRIES);

  saveRanking(trimmed);
  return newEntry;
}

// ランキング内の順位を取得
export function getRank(score: number, difficulty: Difficulty): number {
  const ranking = getRankingByDifficulty(difficulty);
  const rank = ranking.findIndex((entry) => score > entry.score);
  return rank === -1 ? ranking.length + 1 : rank + 1;
}

// トップ10を取得
export function getTopRanking(difficulty: Difficulty, limit = 10): RankingEntry[] {
  return getRankingByDifficulty(difficulty).slice(0, limit);
}

// ニックネーム取得
export function getSavedNickname(): string {
  if (!isBrowser()) return "";
  return localStorage.getItem(NICKNAME_KEY) || "";
}

// ニックネーム保存
export function saveNickname(nickname: string): void {
  if (!isBrowser()) return;
  localStorage.setItem(NICKNAME_KEY, nickname);
}

// ランキングをリセット（全削除）
export function clearRanking(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(RANKING_KEY);
}
