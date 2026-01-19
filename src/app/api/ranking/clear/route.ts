import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";

// ランキング全削除 (DELETE /api/ranking/clear)
export async function DELETE() {
  await prisma.ranking.deleteMany();
  return NextResponse.json({ success: true });
}
