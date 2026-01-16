"use client";

import { useState } from "react";
import { GameMenu, GameScreen } from "@/features/game";
import { Difficulty } from "@/types";

type Screen = "menu" | "game";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [categoryId, setCategoryId] = useState<string | null>(null);

  const handleStart = (diff: Difficulty, catId: string | null) => {
    setDifficulty(diff);
    setCategoryId(catId);
    setScreen("game");
  };

  const handleBack = () => {
    setScreen("menu");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      {screen === "menu" && <GameMenu onStart={handleStart} />}
      {screen === "game" && (
        <GameScreen
          difficulty={difficulty}
          categoryId={categoryId}
          onBack={handleBack}
        />
      )}
    </div>
  );
}
