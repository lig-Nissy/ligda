"use client";

import { useState } from "react";
import { GameMenu, GameScreen, Ranking } from "@/features/game";
import { Difficulty } from "@/types";
import { BgmController } from "@/components/BgmController";

type Screen = "menu" | "game";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [nickname, setNickname] = useState("");
  const [menuDifficulty, setMenuDifficulty] = useState<Difficulty>("normal");

  const handleStart = (diff: Difficulty, catId: string | null, name: string) => {
    setDifficulty(diff);
    setCategoryId(catId);
    setNickname(name);
    setScreen("game");
  };

  const handleBack = () => {
    setScreen("menu");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <BgmController />
      {screen === "menu" && (
        <div className="relative w-full max-w-xl">
          <GameMenu onStart={handleStart} onDifficultyChange={setMenuDifficulty} />
          <div className="hidden lg:block absolute left-full top-1/2 -translate-y-1/2 ml-6 w-96 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6 max-h-[90vh] overflow-y-auto">
            <Ranking difficulty={menuDifficulty} limit={5} showMoreLink />
          </div>
        </div>
      )}
      {screen === "game" && (
        <GameScreen
          difficulty={difficulty}
          categoryId={categoryId}
          nickname={nickname}
          onBack={handleBack}
        />
      )}
    </div>
  );
}
