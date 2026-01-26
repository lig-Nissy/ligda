"use client";

import { useRef, useEffect } from "react";
import { Member } from "@/types";
import { AnswerFeedback, QuestionType } from "../hooks/useLigGame";

interface LigTypingDisplayProps {
  member: Member;
  answer: string;
  onAnswerChange: (value: string) => void;
  onSubmit: () => void;
  timeProgress: number;
  feedback: AnswerFeedback | null;
  questionNumber: number;
  questionType: QuestionType;
}

export function LigTypingDisplay({
  member,
  answer,
  onAnswerChange,
  onSubmit,
  timeProgress,
  feedback,
  questionNumber,
  questionType,
}: LigTypingDisplayProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isComposingRef = useRef(false);

  // 新しい問題になったら入力欄にフォーカス
  useEffect(() => {
    if (!feedback) {
      inputRef.current?.focus();
    }
  }, [member.id, feedback]);

  const getProgressColor = () => {
    if (timeProgress > 0.5) return "bg-green-500";
    if (timeProgress > 0.25) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getProgressBgColor = () => {
    if (timeProgress > 0.5) return "bg-green-100 dark:bg-green-900/30";
    if (timeProgress > 0.25) return "bg-yellow-100 dark:bg-yellow-900/30";
    return "bg-red-100 dark:bg-red-900/30";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !feedback && !isComposingRef.current) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="flex flex-col items-center gap-5 p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg w-full max-w-lg">
      {/* 制限時間プログレスバー */}
      <div className={`w-full h-2 rounded-full ${getProgressBgColor()}`}>
        <div
          className={`h-full rounded-full transition-all duration-100 ${getProgressColor()}`}
          style={{ width: `${timeProgress * 100}%` }}
        />
      </div>

      {/* 問題番号 */}
      <div className="text-sm text-zinc-400 dark:text-zinc-500">
        Q{questionNumber}
      </div>

      {/* 顔写真 */}
      <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-orange-400 shadow-lg">
        <img
          src={member.photoData}
          alt="この人は誰？"
          className="w-full h-full object-cover"
        />
      </div>

      {/* 質問 */}
      <div className="text-lg font-bold text-zinc-700 dark:text-zinc-300">
        {questionType === "nickname" ? "この人のあだ名は？" : "この人の名前は？"}
      </div>

      {/* フィードバック表示 */}
      {feedback ? (
        <div className={`w-full text-center py-3 px-4 rounded-lg text-lg font-bold ${
          feedback.correct
            ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
            : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
        }`}>
          {feedback.correct ? (
            <>正解！ {feedback.correctAnswer}</>
          ) : (
            <>不正解… 答え: {feedback.correctAnswer}</>
          )}
        </div>
      ) : (
        /* 回答入力欄 */
        <div className="w-full">
          <input
            ref={inputRef}
            type="text"
            value={answer}
            onChange={(e) => onAnswerChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => { isComposingRef.current = true; }}
            onCompositionEnd={() => { isComposingRef.current = false; }}
            placeholder={questionType === "nickname" ? "あだ名を入力して Enter" : "名前を入力して Enter"}
            autoComplete="off"
            className="w-full p-4 rounded-lg border-2 border-orange-300 dark:border-orange-600 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 text-xl text-center focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          />
        </div>
      )}
    </div>
  );
}
