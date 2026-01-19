import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";
import { Difficulty } from "@/types";

const MAX_RANKING_ENTRIES = 100;

// ランキング取得 (GET /api/ranking?difficulty=normal&limit=10)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const difficulty = searchParams.get("difficulty") as Difficulty | null;
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? parseInt(limitParam, 10) : MAX_RANKING_ENTRIES;

  const where = difficulty ? { difficulty } : {};

  const rankings = await prisma.ranking.findMany({
    where,
    orderBy: { score: "desc" },
    take: limit,
  });

  // RankingEntry形式に変換
  const entries = rankings.map((r: { id: string; nickname: string; score: number; difficulty: string; accuracy: number; wordsPerMinute: number; totalWords: number; createdAt: Date }) => ({
    id: r.id,
    nickname: r.nickname,
    score: r.score,
    difficulty: r.difficulty as Difficulty,
    accuracy: r.accuracy,
    wordsPerMinute: r.wordsPerMinute,
    totalWords: r.totalWords,
    createdAt: r.createdAt.toISOString(),
  }));

  return NextResponse.json(entries);
}

// ランキング追加 (POST /api/ranking)
export async function POST(request: NextRequest) {
  const body = await request.json();

  const { nickname, score, difficulty, accuracy, wordsPerMinute, totalWords } =
    body;

  // バリデーション
  if (
    !nickname ||
    typeof score !== "number" ||
    !difficulty ||
    typeof accuracy !== "number" ||
    typeof wordsPerMinute !== "number" ||
    typeof totalWords !== "number"
  ) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // 新しいエントリを作成
  const newEntry = await prisma.ranking.create({
    data: {
      nickname,
      score,
      difficulty,
      accuracy,
      wordsPerMinute,
      totalWords,
    },
  });

  // 上位MAX_RANKING_ENTRIES件以外を削除（難易度ごと）
  const rankings = await prisma.ranking.findMany({
    where: { difficulty },
    orderBy: { score: "desc" },
    skip: MAX_RANKING_ENTRIES,
    select: { id: true },
  });

  if (rankings.length > 0) {
    await prisma.ranking.deleteMany({
      where: {
        id: { in: rankings.map((r: { id: string }) => r.id) },
      },
    });
  }

  return NextResponse.json({
    id: newEntry.id,
    nickname: newEntry.nickname,
    score: newEntry.score,
    difficulty: newEntry.difficulty as Difficulty,
    accuracy: newEntry.accuracy,
    wordsPerMinute: newEntry.wordsPerMinute,
    totalWords: newEntry.totalWords,
    createdAt: newEntry.createdAt.toISOString(),
  });
}
