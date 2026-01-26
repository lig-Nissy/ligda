import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";

// LigModeランキング全削除 (DELETE /api/lig-ranking/clear)
export async function DELETE() {
  await prisma.ligRanking.deleteMany();
  return NextResponse.json({ success: true });
}
