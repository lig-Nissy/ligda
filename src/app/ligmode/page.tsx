"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LigGameScreen, LigRanking } from "@/features/game";
import { getSavedNickname, saveNickname } from "@/libs/ranking";
import { detectInjection } from "@/libs/injection";

type Screen = "menu" | "game";

export default function LigModePage() {
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>("menu");
  const [nickname, setNickname] = useState(() => getSavedNickname());

  const handleStart = () => {
    if (detectInjection(nickname)) {
      router.push("/nice-try");
      return;
    }
    const trimmedNickname = nickname.trim() || "名無し";
    saveNickname(trimmedNickname);
    setScreen("game");
  };

  const handleBack = () => {
    setScreen("menu");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      {screen === "menu" && (
        <div className="relative w-full max-w-md">
          <div className="flex flex-col items-center gap-8 p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg w-full">
            <h1 className="text-4xl font-bold text-zinc-800 dark:text-zinc-100">
              LIGMode
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-center">
              社員の顔写真を見て<br />名前をタイピングしよう！
            </p>

            {/* ニックネーム入力 */}
            <div className="w-full">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                ニックネーム
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="名前を入力"
                maxLength={20}
                className="w-full p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100"
              />
            </div>

            {/* スタートボタン */}
            <button
              onClick={handleStart}
              className="w-full py-4 px-8 rounded-full bg-orange-500 text-white text-xl font-bold hover:bg-orange-600 transition-colors"
            >
              スタート
            </button>

            {/* 戻る */}
            <Link
              href="/"
              className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 text-sm"
            >
              メニューへ戻る
            </Link>
          </div>
          <div className="hidden lg:block absolute left-full top-1/2 -translate-y-1/2 ml-6 w-96 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6 max-h-[90vh] overflow-y-auto">
            <LigRanking limit={5} />
          </div>
        </div>
      )}
      {screen === "game" && (
        <LigGameScreen
          nickname={nickname}
          onBack={handleBack}
        />
      )}
    </div>
  );
}
