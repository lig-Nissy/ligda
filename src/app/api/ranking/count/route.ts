import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";

// ランキング件数取得 (GET /api/ranking/count)
export async function GET() {
  const count = await prisma.ranking.count();
  return NextResponse.json({ count });
}
