"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Word, Difficulty, GameResult, DIFFICULTY_CONFIGS } from "@/types";
import {
  hiraganaToRomajiPatterns,
  hiraganaToRomaji,
  checkRomajiInput,
} from "@/libs/romaji";
import { getWordsByCategory } from "@/libs/storage";

export type GameStatus = "idle" | "ready" | "playing" | "finished";

interface TypingState {
  patterns: string[][];
  currentPatternIndex: number;
  currentInput: string;
  typedRomaji: string;
  displayRomaji: string;
}

// ワードの制限時間を計算
function calculateWordTimeLimit(
  reading: string,
  config: (typeof DIFFICULTY_CONFIGS)[keyof typeof DIFFICULTY_CONFIGS]
): number {
  const romajiLength = hiraganaToRomaji(reading).length;
  const calculatedTime = romajiLength * config.baseWordTime;
  return Math.min(Math.max(calculatedTime, config.minWordTime), config.maxWordTime);
}

export function useTypingGame(difficulty: Difficulty, categoryId: string | null) {
  const config = DIFFICULTY_CONFIGS[difficulty];

  const [status, setStatus] = useState<GameStatus>("idle");
  const [words, setWords] = useState<Word[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [typingState, setTypingState] = useState<TypingState | null>(null);

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
  const hadMissInCurrentWord = useRef(false);

  // ワードタイマー関連
  const [wordTimeLeft, setWordTimeLeft] = useState(0);
  const [wordTimeLimit, setWordTimeLimit] = useState(0);
  const wordTimerRef = useRef<NodeJS.Timeout | null>(null);
  const wordStartTimeRef = useRef<number>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const currentWord = words[currentWordIndex] || null;

  // ワードをシャッフル
  const shuffleWords = useCallback((wordList: Word[]): Word[] => {
    const shuffled = [...wordList];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

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
      const timeLimit = calculateWordTimeLimit(word.reading, config);
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

  // 次のワードへ（タイムアウト時も使用）
  const nextWord = useCallback(
    (isTimeout = false) => {
      if (isTimeout) {
        setSkippedWords((c) => c + 1);
        setCombo(0); // タイムアウトでコンボリセット
      }

      // 次のワードのためにミスフラグをリセット
      hadMissInCurrentWord.current = false;

      const nextIndex = currentWordIndex + 1;
      let word: Word;

      if (nextIndex >= words.length) {
        const shuffled = shuffleWords(words);
        setWords(shuffled);
        setCurrentWordIndex(0);
        word = shuffled[0];
      } else {
        setCurrentWordIndex(nextIndex);
        word = words[nextIndex];
      }

      const patterns = hiraganaToRomajiPatterns(word.reading);
      setTypingState({
        patterns,
        currentPatternIndex: 0,
        currentInput: "",
        typedRomaji: "",
        displayRomaji: hiraganaToRomaji(word.reading),
      });

      if (status === "playing") {
        startWordTimer(word);
      }
    },
    [currentWordIndex, words, shuffleWords, status, startWordTimer]
  );

  // ワードタイムアウト処理
  useEffect(() => {
    if (status === "playing" && wordTimeLeft <= 0 && wordTimeLimit > 0) {
      nextWord(true);
    }
  }, [wordTimeLeft, wordTimeLimit, status, nextWord]);

  // ゲーム初期化
  const initGame = useCallback(() => {
    const allWords = getWordsByCategory(categoryId);
    if (allWords.length === 0) {
      alert("ワードが登録されていません。管理画面からワードを追加してください。");
      return;
    }

    clearWordTimer();
    const shuffled = shuffleWords(allWords);
    setWords(shuffled);
    setCurrentWordIndex(0);
    setTimeLeft(config.timeLimit);
    setScore(0);
    setCorrectCount(0);
    setMissCount(0);
    setCompletedWords(0);
    setSkippedWords(0);
    setCombo(0);
    setTotalBonusTime(0);
    setShowBonusEffect(false);
    hadMissInCurrentWord.current = false;
    setWordTimeLeft(0);
    setWordTimeLimit(0);
    setStatus("ready");

    const firstWord = shuffled[0];
    const patterns = hiraganaToRomajiPatterns(firstWord.reading);
    setTypingState({
      patterns,
      currentPatternIndex: 0,
      currentInput: "",
      typedRomaji: "",
      displayRomaji: hiraganaToRomaji(firstWord.reading),
    });
  }, [categoryId, config.timeLimit, shuffleWords, clearWordTimer]);

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

    if (words[0]) {
      startWordTimer(words[0]);
    }
  }, [status, words, startWordTimer]);

  // ゲーム終了
  const endGame = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    clearWordTimer();
    setStatus("finished");
  }, [clearWordTimer]);

  // タイムアップ処理（全体）
  useEffect(() => {
    if (timeLeft === 0 && status === "playing") {
      endGame();
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
        setCorrectCount((c) => c + 1);

        if (result.advancePattern) {
          const newPatternIndex = currentPatternIndex + 1;
          const newTypedRomaji = typingState.typedRomaji + (currentInput || "") + key;

          if (newPatternIndex >= patterns.length) {
            // ワード完了
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

              // コンボボーナス判定
              if (newCombo > 0 && newCombo % config.comboThreshold === 0) {
                // ボーナスタイム付与
                setTimeLeft((prev) => prev + config.comboBonusTime);
                setTotalBonusTime((prev) => prev + config.comboBonusTime);
                setShowBonusEffect(true);
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
    comboThreshold: config.comboThreshold,
    showBonusEffect,
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
