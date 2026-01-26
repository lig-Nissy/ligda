"use client";

import { useState, useEffect, startTransition, useRef } from "react";
import { useLigGame } from "../hooks/useLigGame";
import { LigTypingDisplay } from "./LigTypingDisplay";
import { LigRanking } from "./LigRanking";
import { GameStats } from "./GameStats";
import { GameResult as GameResultType } from "@/types";
import { addLigRankingEntry, getLigRank } from "@/libs/ranking";

interface LigGameScreenProps {
  nickname: string;
  onBack: () => void;
}

function LigGameResult({
  result,
  nickname,
  onRestart,
  onBack,
}: {
  result: GameResultType;
  nickname: string;
  onRestart: () => void;
  onBack: () => void;
}) {
  const [savedEntryId, setSavedEntryId] = useState<string | null>(null);
  const [rank, setRank] = useState<number | null>(null);
  const hasSaved = useRef(false);

  useEffect(() => {
    if (hasSaved.current) return;
    hasSaved.current = true;

    const saveAndFetchRank = async () => {
      const entry = await addLigRankingEntry({
        nickname,
        score: result.score,
        correctCount: result.correctCount,
        missCount: result.missCount,
        accuracy: result.accuracy,
        totalMembers: result.totalWords,
      });
      const currentRank = await getLigRank(result.score);
      startTransition(() => {
        setSavedEntryId(entry.id);
        setRank(currentRank);
      });
    };
    saveAndFetchRank();
  }, [nickname, result]);

  return (
    <div className="flex flex-col items-center gap-6 p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg w-full max-w-lg">
      <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
        LigMode 結果
      </h2>

      <div className="text-6xl font-bold text-orange-500">
        {result.score}
        <span className="text-2xl text-zinc-400 ml-1">点</span>
      </div>

      {/* 順位表示 */}
      {rank !== null && (
        <div className="flex items-center gap-2">
          <span className="text-zinc-600 dark:text-zinc-400">{nickname} さんは</span>
          <span className={`text-2xl font-bold ${rank <= 3 ? "text-yellow-500" : "text-orange-500"}`}>
            {rank}位
          </span>
        </div>
      )}

      <div className="w-full grid grid-cols-2 gap-4 text-center">
        <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-3">
          <div className="text-sm text-zinc-500 dark:text-zinc-400">正解数</div>
          <div className="text-xl font-bold text-green-500">
            {result.correctCount}人
          </div>
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-3">
          <div className="text-sm text-zinc-500 dark:text-zinc-400">不正解数</div>
          <div className="text-xl font-bold text-red-500">
            {result.missCount}人
          </div>
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-3">
          <div className="text-sm text-zinc-500 dark:text-zinc-400">正答率</div>
          <div className="text-xl font-bold text-zinc-800 dark:text-zinc-100">
            {result.accuracy.toFixed(1)}%
          </div>
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-3">
          <div className="text-sm text-zinc-500 dark:text-zinc-400">スコア</div>
          <div className="text-xl font-bold text-orange-500">
            {result.score}
          </div>
        </div>
      </div>

      {/* ランキング */}
      <LigRanking highlightEntryId={savedEntryId ?? undefined} limit={5} />

      <div className="flex gap-3 w-full">
        <button
          onClick={onRestart}
          className="flex-1 py-3 px-4 rounded-full bg-orange-500 text-white font-bold hover:bg-orange-600 transition-colors"
        >
          もう一回
        </button>
        <button
          onClick={onBack}
          className="flex-1 py-3 px-4 rounded-full border-2 border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          メニューへ
        </button>
      </div>
    </div>
  );
}

export function LigGameScreen({ nickname, onBack }: LigGameScreenProps) {
  const {
    status,
    currentMember,
    timeLeft,
    score,
    correctCount,
    missCount,
    completedWords,
    skippedWords,
    combo,
    comboThreshold,
    showBonusEffect,
    lastBonusTime,
    answer,
    setAnswer,
    feedback,
    initGame,
    startGame,
    submitAnswer,
    questionType,
    getResult,
    getQuestionTimeProgress,
  } = useLigGame();

  const questionTimeProgress = getQuestionTimeProgress();

  // ゲーム未初期化
  if (status === "idle") {
    return (
      <div className="flex flex-col items-center gap-8">
        <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
          LigMode
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-center">
          社員の顔写真を見て<br />名前を当てよう！
        </p>
        <button
          onClick={initGame}
          className="py-4 px-8 rounded-full bg-orange-500 text-white text-xl hover:bg-orange-600 transition-colors"
        >
          ゲームを準備する
        </button>
        <button
          onClick={onBack}
          className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          戻る
        </button>
      </div>
    );
  }

  // スタート待ち
  if (status === "ready") {
    return (
      <div className="flex flex-col items-center gap-8">
        <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
          準備完了
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400">
          スペースキーを押してスタート
        </p>
        <div className="animate-pulse text-6xl">👤</div>
        <button
          onClick={startGame}
          className="py-4 px-8 rounded-full bg-orange-500 text-white text-xl hover:bg-orange-600 transition-colors"
        >
          スタート
        </button>
      </div>
    );
  }

  // ゲーム終了
  if (status === "finished") {
    return (
      <LigGameResult
        result={getResult()}
        nickname={nickname}
        onRestart={initGame}
        onBack={onBack}
      />
    );
  }

  // ゲーム中
  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-2xl relative">
      {/* ボーナスエフェクト */}
      {showBonusEffect && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 animate-bounce">
          <div className="bg-yellow-400 text-yellow-900 px-6 py-3 rounded-full font-bold text-lg shadow-lg">
            +{lastBonusTime}秒 ボーナス!
          </div>
        </div>
      )}

      <GameStats
        timeLeft={timeLeft}
        score={score}
        correctCount={correctCount}
        missCount={missCount}
        completedWords={completedWords}
        skippedWords={skippedWords}
        combo={combo}
        comboThreshold={comboThreshold}
      />

      {currentMember && (
        <LigTypingDisplay
          member={currentMember}
          answer={answer}
          onAnswerChange={setAnswer}
          onSubmit={submitAnswer}
          timeProgress={questionTimeProgress}
          feedback={feedback}
          questionNumber={correctCount + missCount + skippedWords + 1}
          questionType={questionType}
        />
      )}

      <p className="text-sm text-zinc-400">
        名前 or あだ名を入力して Enter！5問連続正解で+1秒ボーナス!
      </p>
    </div>
  );
}
