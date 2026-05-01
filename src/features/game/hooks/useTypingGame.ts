"use client";

import { useState, useCallback, useEffect, useRef, startTransition } from "react";
import { Word, Difficulty, GameResult, DIFFICULTY_CONFIGS, WORD_LENGTH_STAGES, WORD_LENGTH_STAGE_SIZE } from "@/types";
import {
  hiraganaToRomajiPatterns,
  hiraganaToRomaji,
  checkRomajiInput,
} from "@/libs/romaji";
import { getWeightedWordsByDifficulty } from "@/libs/storage";
import { playTypeSound, playMissSound, playCorrectSound, playGameEndSound, playBonusSound } from "@/libs/sound";

export type GameStatus = "idle" | "ready" | "playing" | "finished";

interface TypingState {
  patterns: string[][];
  currentPatternIndex: number;
  currentInput: string;
  typedRomaji: string;
  displayRomaji: string;
}

// 問題番号からステージ（文字数範囲）を取得
function getWordLengthStage(questionNumber: number) {
  const stageIndex =
    Math.floor((questionNumber - 1) / WORD_LENGTH_STAGE_SIZE) % WORD_LENGTH_STAGES.length;
  return WORD_LENGTH_STAGES[stageIndex];
}

// ステージの文字数範囲に合うワードをランダムに選択
function selectWordByStage(pool: Word[], questionNumber: number): Word {
  const { min, max } = getWordLengthStage(questionNumber);
  const filtered = pool.filter((w) => w.reading.length >= min && w.reading.length <= max);
  const candidates = filtered.length > 0 ? filtered : pool;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

// ワードの制限時間を計算
function calculateWordTimeLimit(
  word: Word,
  config: (typeof DIFFICULTY_CONFIGS)[keyof typeof DIFFICULTY_CONFIGS]
): number {
  // アルファベットの場合はそのまま文字数、ひらがなの場合はローマ字変換後の文字数
  const inputLength =
    word.inputType === "alphabet"
      ? word.reading.length
      : hiraganaToRomaji(word.reading).length;
  const calculatedTime = inputLength * config.baseWordTime;
  return Math.min(Math.max(calculatedTime, config.minWordTime), config.maxWordTime);
}

export function useTypingGame(difficulty: Difficulty, categoryId: string | null) {
  const config = DIFFICULTY_CONFIGS[difficulty];

  const [status, setStatus] = useState<GameStatus>("idle");
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [typingState, setTypingState] = useState<TypingState | null>(null);

  const allWordsRef = useRef<Word[]>([]);
  const questionNumberRef = useRef(1);

  const [timeLeft, setTimeLeft] = useState(config.timeLimit);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [missCount, setMissCount] = useState(0);
  const [completedWords, setCompletedWords] = useState(0);
  const [skippedWords, setSkippedWords] = useState(0);

  // コンボ関連
  const [combo, setCombo] = useState(0); // 連続正解数（ミスなしでワードクリア）
  const [showBonusEffect, setShowBonusEffect] = useState(false);
  const [totalBonusTime, setTotalBonusTime] = useState(0);
  const [lastBonusTime, setLastBonusTime] = useState(0); // 最後に付与したボーナス時間
  const hadMissInCurrentWord = useRef(false);

  // ワードタイマー関連
  const [wordTimeLeft, setWordTimeLeft] = useState(0);
  const [wordTimeLimit, setWordTimeLimit] = useState(0);
  const wordTimerRef = useRef<NodeJS.Timeout | null>(null);
  const wordStartTimeRef = useRef<number>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // ワードタイマーをクリア
  const clearWordTimer = useCallback(() => {
    if (wordTimerRef.current) {
      clearInterval(wordTimerRef.current);
      wordTimerRef.current = null;
    }
  }, []);

  // ワードタイマーを開始
  const startWordTimer = useCallback(
    (word: Word) => {
      clearWordTimer();
      const timeLimit = calculateWordTimeLimit(word, config);
      setWordTimeLimit(timeLimit);
      setWordTimeLeft(timeLimit);
      wordStartTimeRef.current = Date.now();

      wordTimerRef.current = setInterval(() => {
        const elapsed = Date.now() - wordStartTimeRef.current;
        const remaining = Math.max(0, timeLimit - elapsed);
        setWordTimeLeft(remaining);

        if (remaining <= 0) {
          clearWordTimer();
        }
      }, 50);
    },
    [config, clearWordTimer]
  );

  // ワードからTypingStateを生成してセット
  const applyWord = useCallback(
    (word: Word) => {
      const patterns =
        word.inputType === "alphabet"
          ? word.reading.split("").map((char: string) => [char])
          : hiraganaToRomajiPatterns(word.reading);
      const displayRomaji =
        word.inputType === "alphabet" ? word.reading : hiraganaToRomaji(word.reading);
      setCurrentWord(word);
      setTypingState({
        patterns,
        currentPatternIndex: 0,
        currentInput: "",
        typedRomaji: "",
        displayRomaji,
      });
    },
    []
  );

  // 次のワードへ（タイムアウト時も使用）
  const nextWord = useCallback(
    (isTimeout = false) => {
      if (isTimeout) {
        setSkippedWords((c) => c + 1);
        setCombo(0);
      }
      hadMissInCurrentWord.current = false;

      questionNumberRef.current += 1;
      const word = selectWordByStage(allWordsRef.current, questionNumberRef.current);
      applyWord(word);

      if (status === "playing") {
        startWordTimer(word);
      }
    },
    [status, startWordTimer, applyWord]
  );

  // ワードタイムアウト処理
  useEffect(() => {
    if (status === "playing" && wordTimeLeft <= 0 && wordTimeLimit > 0) {
      startTransition(() => {
        nextWord(true);
      });
    }
  }, [wordTimeLeft, wordTimeLimit, status, nextWord]);

  // ゲーム初期化
  const initGame = useCallback(async () => {
    const allWords = await getWeightedWordsByDifficulty(difficulty, categoryId);
    if (allWords.length === 0) {
      alert("ワードが登録されていません。管理画面からワードを追加してください。");
      return;
    }

    allWordsRef.current = allWords;
    questionNumberRef.current = 1;
    clearWordTimer();
    setTimeLeft(config.timeLimit);
    setScore(0);
    setCorrectCount(0);
    setMissCount(0);
    setCompletedWords(0);
    setSkippedWords(0);
    setCombo(0);
    setTotalBonusTime(0);
    setLastBonusTime(0);
    setShowBonusEffect(false);
    hadMissInCurrentWord.current = false;
    setWordTimeLeft(0);
    setWordTimeLimit(0);
    setStatus("ready");

    const firstWord = selectWordByStage(allWords, 1);
    applyWord(firstWord);
  }, [difficulty, categoryId, config.timeLimit, clearWordTimer, applyWord]);

  // ゲーム開始
  const startGame = useCallback(() => {
    if (status !== "ready") return;
    setStatus("playing");
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    if (currentWord) {
      startWordTimer(currentWord);
    }
  }, [status, currentWord, startWordTimer]);

  // ゲーム終了
  const endGame = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    clearWordTimer();
    setStatus("finished");
    playGameEndSound();
  }, [clearWordTimer]);

  // タイムアップ処理（全体）
  useEffect(() => {
    if (timeLeft === 0 && status === "playing") {
      startTransition(() => {
        endGame();
      });
    }
  }, [timeLeft, status, endGame]);

  // キー入力処理
  const handleKeyPress = useCallback(
    (key: string) => {
      if (status !== "playing" || !typingState || !currentWord) return;

      if (key.length !== 1) return;

      const { patterns, currentPatternIndex, currentInput } = typingState;

      if (currentPatternIndex >= patterns.length) {
        return;
      }

      const result = checkRomajiInput(
        patterns,
        currentPatternIndex,
        currentInput,
        key.toLowerCase()
      );

      if (result.matched) {
        playTypeSound();
        setCorrectCount((c) => c + 1);

        if (result.advancePattern) {
          const newPatternIndex = currentPatternIndex + 1;
          const newTypedRomaji = typingState.typedRomaji + (currentInput || "") + key;

          if (newPatternIndex >= patterns.length) {
            // ワード完了
            playCorrectSound();
            setCompletedWords((c) => c + 1);

            // スコア計算
            const baseScore = 100 * config.scoreMultiplier;
            const timeBonus = Math.floor(
              (wordTimeLeft / wordTimeLimit) * 50 * config.timeBonusMultiplier
            );
            setScore((s) => s + Math.ceil(baseScore + timeBonus));

            // コンボ処理（ミスなしでクリアした場合のみコンボ継続）
            if (!hadMissInCurrentWord.current) {
              const newCombo = combo + 1;
              setCombo(newCombo);

              // コンボボーナス判定（5問ごとにボーナス、段階的に時間増加）
              // 5問: +1秒、10問: +2秒、15問以降: +3秒
              if (newCombo > 0 && newCombo % 5 === 0) {
                const comboLevel = Math.floor(newCombo / 5); // 1, 2, 3, ...
                const bonusTime = Math.min(comboLevel, 3); // 最大3秒
                setTimeLeft((prev) => prev + bonusTime);
                setTotalBonusTime((prev) => prev + bonusTime);
                setLastBonusTime(bonusTime);
                setShowBonusEffect(true);
                playBonusSound();
                setTimeout(() => setShowBonusEffect(false), 1500);
              }
            } else {
              // ミスがあった場合はコンボリセット
              setCombo(0);
            }

            nextWord(false);
          } else {
            setTypingState({
              ...typingState,
              currentPatternIndex: newPatternIndex,
              currentInput: "",
              typedRomaji: newTypedRomaji,
            });
          }
        } else {
          setTypingState({
            ...typingState,
            currentInput: result.newInput,
          });
        }
      } else {
        playMissSound();
        setMissCount((c) => c + 1);
        hadMissInCurrentWord.current = true; // ミスフラグを立てる
      }
    },
    [status, typingState, currentWord, config, wordTimeLeft, wordTimeLimit, combo, nextWord]
  );

  // キーボードイベントリスナー
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status === "ready" && e.key === " ") {
        e.preventDefault();
        startGame();
        return;
      }

      if (status === "playing") {
        e.preventDefault();
        handleKeyPress(e.key);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [status, startGame, handleKeyPress]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      clearWordTimer();
    };
  }, [clearWordTimer]);

  // 結果計算
  const getResult = useCallback((): GameResult => {
    const elapsedTime = config.timeLimit - timeLeft;
    const totalInputs = correctCount + missCount;
    const accuracy = totalInputs > 0 ? (correctCount / totalInputs) * 100 : 0;
    const wordsPerMinute =
      elapsedTime > 0 ? (completedWords / elapsedTime) * 60 : 0;

    return {
      score,
      correctCount,
      missCount,
      totalWords: completedWords,
      accuracy,
      wordsPerMinute,
      elapsedTime,
    };
  }, [config.timeLimit, timeLeft, correctCount, missCount, completedWords, score]);

  // タイピング表示用のデータ
  const getTypingDisplay = useCallback(() => {
    if (!typingState) return { typed: "", remaining: "" };

    const { displayRomaji, typedRomaji, currentInput } = typingState;
    const typed = typedRomaji + currentInput;
    const remaining = displayRomaji.slice(typed.length);

    return { typed, remaining };
  }, [typingState]);

  // ワードタイマーの進捗（0-1）
  const getWordTimeProgress = useCallback(() => {
    if (wordTimeLimit === 0) return 1;
    return wordTimeLeft / wordTimeLimit;
  }, [wordTimeLeft, wordTimeLimit]);

  return {
    status,
    currentWord,
    timeLeft,
    score,
    correctCount,
    missCount,
    completedWords,
    skippedWords,
    combo,
    comboThreshold: 5, // 5問ごとにボーナス（固定）
    showBonusEffect,
    lastBonusTime,
    totalBonusTime,
    wordTimeLeft,
    wordTimeLimit,
    initGame,
    startGame,
    endGame,
    getResult,
    getTypingDisplay,
    getWordTimeProgress,
  };
}
