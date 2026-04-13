import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";
import { Difficulty } from "@/types";

const MAX_RANKING_ENTRIES = 100;

// ランキング取得 (GET /api/ranking?difficulty=normal&categoryId=xxx&limit=10)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const difficulty = searchParams.get("difficulty") as Difficulty | null;
  const categoryId = searchParams.get("categoryId"); // null, "", または実際のID
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? parseInt(limitParam, 10) : MAX_RANKING_ENTRIES;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (difficulty) {
    where.difficulty = difficulty;
  }
  // categoryIdが指定された場合のみフィルタ（空文字は「すべてのカテゴリ」=categoryId: null）
  if (categoryId !== null) {
    where.categoryId = categoryId === "" ? null : categoryId;
  }

  const rankings = await prisma.ranking.findMany({
    where,
    orderBy: { score: "desc" },
    take: limit,
  });

  // RankingEntry形式に変換
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const entries = rankings.map((r: any) => ({
    id: r.id,
    nickname: r.nickname,
    score: r.score,
    difficulty: r.difficulty as Difficulty,
    categoryId: r.categoryId ?? null,
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

  const { nickname, score, difficulty, categoryId, accuracy, wordsPerMinute, totalWords } =
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
      categoryId: categoryId || null,
      accuracy,
      wordsPerMinute,
      totalWords,
    },
  });

  // 上位MAX_RANKING_ENTRIES件以外を削除（難易度 + カテゴリごと）
  const rankings = await prisma.ranking.findMany({
    where: { difficulty, categoryId: categoryId || null },
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const entry = newEntry as any;
  return NextResponse.json({
    id: entry.id,
    nickname: entry.nickname,
    score: entry.score,
    difficulty: entry.difficulty as Difficulty,
    categoryId: entry.categoryId ?? null,
    accuracy: entry.accuracy,
    wordsPerMinute: entry.wordsPerMinute,
    totalWords: entry.totalWords,
    createdAt: entry.createdAt.toISOString(),
  });
}
