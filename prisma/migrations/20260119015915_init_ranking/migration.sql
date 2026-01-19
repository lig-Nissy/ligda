-- CreateTable
CREATE TABLE "Ranking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nickname" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "difficulty" TEXT NOT NULL,
    "accuracy" REAL NOT NULL,
    "wordsPerMinute" REAL NOT NULL,
    "totalWords" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "Ranking_difficulty_score_idx" ON "Ranking"("difficulty", "score" DESC);
