import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";

// ワード一括削除 (POST /api/words/bulk-delete)
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { ids } = body;

  if (!Array.isArray(ids)) {
    return NextResponse.json({ error: "ids array is required" }, { status: 400 });
  }

  const result = await prisma.word.deleteMany({
    where: { id: { in: ids } },
  });

  return NextResponse.json({ count: result.count });
}
