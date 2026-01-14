// 難易度
export type Difficulty = "easy" | "normal" | "hard";

// 難易度別の重み（出現頻度）
export interface DifficultyWeights {
  easy: number;
  normal: number;
  hard: number;
}

// 入力タイプ
export type InputType = "hiragana" | "alphabet";

// ワード（タイピング対象）
export interface Word {
  id: string;
  text: string; // 表示テキスト
  reading: string; // ふりがな（ひらがな）またはアルファベット
  inputType: InputType; // 入力タイプ
  categoryId: string;
  weights: DifficultyWeights; // 難易度別の重み
  createdAt: string;
  updatedAt: string;
}

// デフォルトの重み
export const DEFAULT_WEIGHTS: DifficultyWeights = {
  easy: 1,
  normal: 1,
  hard: 1,
};

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
  timeLimit: number; // ゲーム全体の制限時間（秒）
  baseWordTime: number; // 1文字あたりの基準時間（ミリ秒）
  minWordTime: number; // 1ワードの最小時間（ミリ秒）
  maxWordTime: number; // 1ワードの最大時間（ミリ秒）
  scoreMultiplier: number;
  timeBonusMultiplier: number; // 早くクリアした時のボーナス倍率
  // コンボボーナス設定
  comboThreshold: number; // ボーナス発生に必要な連続正解数
  comboBonusTime: number; // ボーナスで追加される時間（秒）
}

// 難易度設定
// ワードの制限時間 = 文字数 × baseWordTime（min/maxで制限）
export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    timeLimit: 60,
    baseWordTime: 1200, // 1文字1.2秒
    minWordTime: 4000, // 最低4秒
    maxWordTime: 12000, // 最大12秒
    scoreMultiplier: 1,
    timeBonusMultiplier: 0.5,
    comboThreshold: 3, // 3語連続でボーナス
    comboBonusTime: 5, // +5秒
  },
  normal: {
    timeLimit: 90,
    baseWordTime: 800, // 1文字0.8秒
    minWordTime: 3000, // 最低3秒
    maxWordTime: 8000, // 最大8秒
    scoreMultiplier: 1.5,
    timeBonusMultiplier: 1,
    comboThreshold: 5, // 5語連続でボーナス
    comboBonusTime: 5, // +5秒
  },
  hard: {
    timeLimit: 120,
    baseWordTime: 500, // 1文字0.5秒
    minWordTime: 2000, // 最低2秒
    maxWordTime: 5000, // 最大5秒
    scoreMultiplier: 2,
    timeBonusMultiplier: 1.5,
    comboThreshold: 5, // 5語連続でボーナス
    comboBonusTime: 3, // +3秒
  },
};
