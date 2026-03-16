"use client";

import { useState, useCallback, useEffect, useRef, startTransition } from "react";
import { Member, GameResult, DIFFICULTY_CONFIGS } from "@/types";
import { getMembers } from "@/libs/storage";
import { playMissSound, playCorrectSound, playGameEndSound, playBonusSound } from "@/libs/sound";

export type LigGameStatus = "idle" | "ready" | "playing" | "finished";
export type QuestionType = "name" | "nickname";

// 回答のフィードバック
export interface AnswerFeedback {
  correct: boolean;
  correctAnswer: string; // 正解の名前
  memberName: string;
}

// 1問あたりの制限時間（ミリ秒）
const QUESTION_TIME_LIMIT = 10000;

export function useLigGame() {
  const config = DIFFICULTY_CONFIGS.normal;

  const [status, setStatus] = useState<LigGameStatus>("idle");
  const [members, setMembers] = useState<Member[]>([]);
  const [currentMemberIndex, setCurrentMemberIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [questionType, setQuestionType] = useState<QuestionType>("name");

  const [timeLeft, setTimeLeft] = useState(config.timeLimit);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [missCount, setMissCount] = useState(0);
  const [completedWords, setCompletedWords] = useState(0);
  const [skippedWords, setSkippedWords] = useState(0);

  // コンボ関連
  const [combo, setCombo] = useState(0);
  const [showBonusEffect, setShowBonusEffect] = useState(false);
  const [lastBonusTime, setLastBonusTime] = useState(0);

  // フィードバック表示
  const [feedback, setFeedback] = useState<AnswerFeedback | null>(null);

  // 問題タイマー関連
  const [questionTimeLeft, setQuestionTimeLeft] = useState(0);
  const [questionTimeLimit, setQuestionTimeLimit] = useState(0);
  const questionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const questionStartTimeRef = useRef<number>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentMember = members[currentMemberIndex] || null;

  // メンバーをシャッフル
  const shuffleMembers = useCallback((memberList: Member[]): Member[] => {
    const shuffled = [...memberList];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  // 問題タイマーをクリア
  const clearQuestionTimer = useCallback(() => {
    if (questionTimerRef.current) {
      clearInterval(questionTimerRef.current);
      questionTimerRef.current = null;
    }
  }, []);

  // 問題タイマーを開始
  const startQuestionTimer = useCallback(() => {
    clearQuestionTimer();
    setQuestionTimeLimit(QUESTION_TIME_LIMIT);
    setQuestionTimeLeft(QUESTION_TIME_LIMIT);
    questionStartTimeRef.current = Date.now();

    questionTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - questionStartTimeRef.current;
      const remaining = Math.max(0, QUESTION_TIME_LIMIT - elapsed);
      setQuestionTimeLeft(remaining);

      if (remaining <= 0) {
        clearQuestionTimer();
      }
    }, 50);
  }, [clearQuestionTimer]);

  // 問題タイプをランダムに選択
  const pickQuestionType = useCallback((member: Member): QuestionType => {
    if (member.nickname) {
      return Math.random() < 0.5 ? "name" : "nickname";
    }
    return "name";
  }, []);

  // 正解判定（問題タイプに応じた判定）
  const checkAnswer = useCallback((input: string, member: Member, qType: QuestionType): boolean => {
    const normalized = input.trim().toLowerCase();
    if (!normalized) return false;

    const candidates: string[] =
      qType === "name"
        ? [member.name, member.nameReading].filter(Boolean) as string[]
        : [member.nickname, member.nicknameReading].filter(Boolean) as string[];

    return candidates.some((c) => c.toLowerCase() === normalized);
  }, []);

  // ゲーム終了
  const endGame = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    clearQuestionTimer();
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
    }
    setFeedback(null);
    setStatus("finished");
    playGameEndSound();
  }, [clearQuestionTimer]);

  // 次の問題へ進む
  const goToNext = useCallback(
    (isTimeout = false) => {
      if (isTimeout) {
        setSkippedWords((c) => c + 1);
        setCombo(0);
      }

      setAnswer("");
      setFeedback(null);

      const nextIndex = currentMemberIndex + 1;
      if (nextIndex >= members.length) {
        // 全員出題済み → ゲーム終了
        endGame();
        return;
      }

      setCurrentMemberIndex(nextIndex);
      setQuestionType(pickQuestionType(members[nextIndex]));
      startQuestionTimer();
    },
    [currentMemberIndex, members, pickQuestionType, startQuestionTimer, endGame]
  );

  // 問題タイムアウト処理
  useEffect(() => {
    if (status === "playing" && questionTimeLeft <= 0 && questionTimeLimit > 0 && !feedback) {
      const member = members[currentMemberIndex];
      if (!member) return;

      clearQuestionTimer();
      playMissSound();
      setMissCount((c) => c + 1);

      setFeedback({
        correct: false,
        correctAnswer: questionType === "nickname"
          ? (member.nickname || member.name)
          : member.name,
        memberName: member.name,
      });

      feedbackTimerRef.current = setTimeout(() => {
        startTransition(() => {
          goToNext(true);
        });
      }, 1500);
    }
  }, [questionTimeLeft, questionTimeLimit, status, feedback, members, currentMemberIndex, clearQuestionTimer, goToNext, questionType]);

  // 回答を送信
  const submitAnswer = useCallback(() => {
    if (status !== "playing" || !currentMember || feedback) return;

    clearQuestionTimer();
    const isCorrect = checkAnswer(answer, currentMember, questionType);

    if (isCorrect) {
      playCorrectSound();
      setCorrectCount((c) => c + 1);
      setCompletedWords((c) => c + 1);

      // スコア計算
      const baseScore = 100 * config.scoreMultiplier;
      const timeBonus = Math.floor(
        (questionTimeLeft / questionTimeLimit) * 50 * config.timeBonusMultiplier
      );
      setScore((s) => s + Math.ceil(baseScore + timeBonus));

      // コンボ処理
      const newCombo = combo + 1;
      setCombo(newCombo);

      if (newCombo > 0 && newCombo % 5 === 0) {
        const comboLevel = Math.floor(newCombo / 5);
        const bonusTime = Math.min(comboLevel, 3);
        setTimeLeft((prev) => prev + bonusTime);
        setLastBonusTime(bonusTime);
        setShowBonusEffect(true);
        playBonusSound();
        setTimeout(() => setShowBonusEffect(false), 1500);
      }
    } else {
      playMissSound();
      setMissCount((c) => c + 1);
      setCombo(0);
    }

    setFeedback({
      correct: isCorrect,
      correctAnswer: questionType === "nickname"
        ? (currentMember.nickname || currentMember.name)
        : currentMember.name,
      memberName: currentMember.name,
    });

    feedbackTimerRef.current = setTimeout(() => {
      startTransition(() => {
        goToNext(false);
      });
    }, isCorrect ? 800 : 1500);
  }, [status, currentMember, feedback, answer, checkAnswer, clearQuestionTimer, config, questionTimeLeft, questionTimeLimit, combo, goToNext, questionType]);

  // ゲーム初期化
  const initGame = useCallback(async () => {
    const allMembers = await getMembers();
    if (allMembers.length === 0) {
      alert("メンバーが登録されていません。管理画面からメンバーを追加してください。");
      return;
    }

    clearQuestionTimer();
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
    }
    const shuffled = shuffleMembers(allMembers);
    setMembers(shuffled);
    setCurrentMemberIndex(0);
    setAnswer("");
    setTimeLeft(config.timeLimit);
    setScore(0);
    setCorrectCount(0);
    setMissCount(0);
    setCompletedWords(0);
    setSkippedWords(0);
    setCombo(0);
    setLastBonusTime(0);
    setShowBonusEffect(false);
    setFeedback(null);
    setQuestionTimeLeft(0);
    setQuestionTimeLimit(0);
    setStatus("ready");
  }, [config.timeLimit, shuffleMembers, clearQuestionTimer]);

  // ゲーム開始
  const startGame = useCallback(() => {
    if (status !== "ready") return;
    setStatus("playing");

    // 最初の問題タイプを設定
    if (members.length > 0) {
      setQuestionType(pickQuestionType(members[0]));
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    startQuestionTimer();
  }, [status, members, pickQuestionType, startQuestionTimer]);

  // タイムアップ処理
  useEffect(() => {
    if (timeLeft === 0 && status === "playing") {
      startTransition(() => {
        endGame();
      });
    }
  }, [timeLeft, status, endGame]);

  // スペースキーでスタート
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status === "ready" && e.key === " ") {
        e.preventDefault();
        startGame();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [status, startGame]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      clearQuestionTimer();
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, [clearQuestionTimer]);

  // 結果計算
  const getResult = useCallback((): GameResult => {
    const elapsedTime = config.timeLimit - timeLeft;
    const totalAttempts = correctCount + missCount;
    const accuracy = totalAttempts > 0 ? (correctCount / totalAttempts) * 100 : 0;
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

  // 問題タイマーの進捗
  const getQuestionTimeProgress = useCallback(() => {
    if (questionTimeLimit === 0) return 1;
    return questionTimeLeft / questionTimeLimit;
  }, [questionTimeLeft, questionTimeLimit]);

  return {
    status,
    currentMember,
    timeLeft,
    score,
    correctCount,
    missCount,
    completedWords,
    skippedWords,
    combo,
    comboThreshold: 5,
    showBonusEffect,
    lastBonusTime,
    answer,
    setAnswer,
    feedback,
    initGame,
    startGame,
    endGame,
    submitAnswer,
    questionType,
    getResult,
    getQuestionTimeProgress,
  };
}
