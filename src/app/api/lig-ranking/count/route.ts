import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";

// LigModeランキング件数取得 (GET /api/lig-ranking/count)
export async function GET() {
  const count = await prisma.ligRanking.count();
  return NextResponse.json({ count });
}
