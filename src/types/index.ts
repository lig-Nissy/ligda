// 難易度
export type Difficulty = "easy" | "normal" | "hard";

// ワード（タイピング対象）
export interface Word {
  id: string;
  text: string; // 表示テキスト（日本語）
  reading: string; // ふりがな（ひらがな）
  categoryId: string;
  createdAt: string;
  updatedAt: string;
}

// カテゴリ
export interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// ゲーム設定
export interface GameConfig {
  difficulty: Difficulty;
  timeLimit: number; // 秒
  categoryId: string | null; // nullの場合は全カテゴリ
}

// ゲーム結果
export interface GameResult {
  score: number;
  correctCount: number;
  missCount: number;
  totalWords: number;
  accuracy: number;
  wordsPerMinute: number;
  elapsedTime: number;
}

// ゲーム中のワード状態
export interface GameWord {
  word: Word;
  typedRomaji: string;
  remainingRomaji: string;
  isCompleted: boolean;
}

// 難易度設定
export interface DifficultyConfig {
  timeLimit: number;
  wordDisplayTime: number; // 1ワードあたりの表示時間（ミリ秒）
  scoreMultiplier: number;
}

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    timeLimit: 60,
    wordDisplayTime: 8000,
    scoreMultiplier: 1,
  },
  normal: {
    timeLimit: 90,
    wordDisplayTime: 5000,
    scoreMultiplier: 1.5,
  },
  hard: {
    timeLimit: 120,
    wordDisplayTime: 3000,
    scoreMultiplier: 2,
  },
};
