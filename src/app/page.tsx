"use client";

import { Suspense, useCallback, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { GameMenu, GameScreen, Ranking } from "@/features/game";
import { Difficulty } from "@/types";

type Screen = "menu" | "game";

function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <div className="text-zinc-500 dark:text-zinc-400 text-sm">読み込み中...</div>
      </div>
    </div>
  );
}

function HomeContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialCategoryId = searchParams.get("categoryId") || null;

  const [screen, setScreen] = useState<Screen>("menu");
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [categoryId, setCategoryId] = useState<string | null>(initialCategoryId);
  const [nickname, setNickname] = useState("");
  const [menuDifficulty, setMenuDifficulty] = useState<Difficulty>("normal");
  const [menuCategoryId, setMenuCategoryId] = useState<string | null>(initialCategoryId);
  const [menuReady, setMenuReady] = useState(false);

  const handleStart = (diff: Difficulty, catId: string | null, name: string) => {
    setDifficulty(diff);
    setCategoryId(catId);
    setNickname(name);
    setScreen("game");
  };

  const handleBack = () => {
    setScreen("menu");
  };

  const handleCategoryChange = (catId: string | null) => {
    setMenuCategoryId(catId);
    const params = new URLSearchParams(searchParams.toString());
    if (catId) {
      params.set("categoryId", catId);
    } else {
      params.delete("categoryId");
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const handleMenuReady = useCallback(() => {
    setMenuReady(true);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      {screen === "menu" && (
        <>
          {!menuReady && <LoadingOverlay />}
          <div
            className={`relative w-full max-w-xl transition-opacity ${menuReady ? "opacity-100" : "opacity-0"}`}
          >
            <GameMenu
              onStart={handleStart}
              onDifficultyChange={setMenuDifficulty}
              onCategoryChange={handleCategoryChange}
              onReady={handleMenuReady}
              initialCategoryId={initialCategoryId}
            />
            <div className="hidden lg:block absolute left-full top-1/2 -translate-y-1/2 ml-6 w-96 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6 max-h-[90vh] overflow-y-auto">
              <Ranking difficulty={menuDifficulty} categoryId={menuCategoryId} limit={5} showMoreLink />
            </div>
          </div>
        </>
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

export default function Home() {
  return (
    <Suspense fallback={<LoadingOverlay />}>
      <HomeContent />
    </Suspense>
  );
}
