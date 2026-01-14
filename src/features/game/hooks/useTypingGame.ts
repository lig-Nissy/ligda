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

  // ゲーム初期化
  const initGame = useCallback(() => {
    const allWords = getWordsByCategory(categoryId);
    if (allWords.length === 0) {
      alert("ワードが登録されていません。管理画面からワードを追加してください。");
      return;
    }

    const shuffled = shuffleWords(allWords);
    setWords(shuffled);
    setCurrentWordIndex(0);
    setTimeLeft(config.timeLimit);
    setScore(0);
    setCorrectCount(0);
    setMissCount(0);
    setCompletedWords(0);
    setStatus("ready");

    // 最初のワードのタイピング状態を初期化
    const firstWord = shuffled[0];
    const patterns = hiraganaToRomajiPatterns(firstWord.reading);
    setTypingState({
      patterns,
      currentPatternIndex: 0,
      currentInput: "",
      typedRomaji: "",
      displayRomaji: hiraganaToRomaji(firstWord.reading),
    });
  }, [categoryId, config.timeLimit, shuffleWords]);

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
  }, [status]);

  // ゲーム終了
  const endGame = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setStatus("finished");
  }, []);

  // タイムアップ処理
  useEffect(() => {
    if (timeLeft === 0 && status === "playing") {
      endGame();
    }
  }, [timeLeft, status, endGame]);

  // 次のワードへ
  const nextWord = useCallback(() => {
    const nextIndex = currentWordIndex + 1;
    if (nextIndex >= words.length) {
      // ワードを再シャッフルして続行
      const shuffled = shuffleWords(words);
      setWords(shuffled);
      setCurrentWordIndex(0);
      const word = shuffled[0];
      const patterns = hiraganaToRomajiPatterns(word.reading);
      setTypingState({
        patterns,
        currentPatternIndex: 0,
        currentInput: "",
        typedRomaji: "",
        displayRomaji: hiraganaToRomaji(word.reading),
      });
    } else {
      setCurrentWordIndex(nextIndex);
      const word = words[nextIndex];
      const patterns = hiraganaToRomajiPatterns(word.reading);
      setTypingState({
        patterns,
        currentPatternIndex: 0,
        currentInput: "",
        typedRomaji: "",
        displayRomaji: hiraganaToRomaji(word.reading),
      });
    }
  }, [currentWordIndex, words, shuffleWords]);

  // キー入力処理
  const handleKeyPress = useCallback(
    (key: string) => {
      if (status !== "playing" || !typingState || !currentWord) return;

      // 特殊キーは無視
      if (key.length !== 1) return;

      const { patterns, currentPatternIndex, currentInput } = typingState;

      if (currentPatternIndex >= patterns.length) {
        // 全パターン完了
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
          const completedChar = patterns[currentPatternIndex][0];
          const newTypedRomaji = typingState.typedRomaji + (currentInput || "") + key;

          if (newPatternIndex >= patterns.length) {
            // ワード完了
            setCompletedWords((c) => c + 1);
            setScore((s) => s + Math.ceil(100 * config.scoreMultiplier));
            nextWord();
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
      }
    },
    [status, typingState, currentWord, config.scoreMultiplier, nextWord]
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
    };
  }, []);

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

  return {
    status,
    currentWord,
    timeLeft,
    score,
    correctCount,
    missCount,
    completedWords,
    initGame,
    startGame,
    endGame,
    getResult,
    getTypingDisplay,
  };
}
