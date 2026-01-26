import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";

const MAX_RANKING_ENTRIES = 100;

// ランキング取得 (GET /api/lig-ranking?limit=10)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? parseInt(limitParam, 10) : MAX_RANKING_ENTRIES;

  const rankings = await prisma.ligRanking.findMany({
    orderBy: { score: "desc" },
    take: limit,
  });

  const entries = rankings.map((r: { id: string; nickname: string; score: number; correctCount: number; missCount: number; accuracy: number; totalMembers: number; createdAt: Date }) => ({
    id: r.id,
    nickname: r.nickname,
    score: r.score,
    correctCount: r.correctCount,
    missCount: r.missCount,
    accuracy: r.accuracy,
    totalMembers: r.totalMembers,
    createdAt: r.createdAt.toISOString(),
  }));

  return NextResponse.json(entries);
}

// ランキング追加 (POST /api/lig-ranking)
export async function POST(request: NextRequest) {
  const body = await request.json();

  const { nickname, score, correctCount, missCount, accuracy, totalMembers } = body;

  if (
    !nickname ||
    typeof score !== "number" ||
    typeof correctCount !== "number" ||
    typeof missCount !== "number" ||
    typeof accuracy !== "number" ||
    typeof totalMembers !== "number"
  ) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const newEntry = await prisma.ligRanking.create({
    data: {
      nickname,
      score,
      correctCount,
      missCount,
      accuracy,
      totalMembers,
    },
  });

  // 上位MAX_RANKING_ENTRIES件以外を削除
  const overflow = await prisma.ligRanking.findMany({
    orderBy: { score: "desc" },
    skip: MAX_RANKING_ENTRIES,
    select: { id: true },
  });

  if (overflow.length > 0) {
    await prisma.ligRanking.deleteMany({
      where: {
        id: { in: overflow.map((r: { id: string }) => r.id) },
      },
    });
  }

  return NextResponse.json({
    id: newEntry.id,
    nickname: newEntry.nickname,
    score: newEntry.score,
    correctCount: newEntry.correctCount,
    missCount: newEntry.missCount,
    accuracy: newEntry.accuracy,
    totalMembers: newEntry.totalMembers,
    createdAt: newEntry.createdAt.toISOString(),
  });
}
