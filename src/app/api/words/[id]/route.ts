import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";

type Params = Promise<{ id: string }>;

// ワードをフロントエンド形式に変換
function toWordResponse(word: {
  id: string;
  text: string;
  reading: string;
  inputType: string;
  categoryId: string;
  weightEasy: number;
  weightNormal: number;
  weightHard: number;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: word.id,
    text: word.text,
    reading: word.reading,
    inputType: word.inputType as "hiragana" | "alphabet",
    categoryId: word.categoryId,
    weights: {
      easy: word.weightEasy,
      normal: word.weightNormal,
      hard: word.weightHard,
    },
    createdAt: word.createdAt.toISOString(),
    updatedAt: word.updatedAt.toISOString(),
  };
}

// ワード更新 (PUT /api/words/[id])
export async function PUT(request: NextRequest, { params }: { params: Params }) {
  const { id } = await params;
  const body = await request.json();
  const { text, reading, inputType, categoryId, weights } = body;

  const word = await prisma.word.update({
    where: { id },
    data: {
      ...(text !== undefined && { text }),
      ...(reading !== undefined && { reading }),
      ...(inputType !== undefined && { inputType }),
      ...(categoryId !== undefined && { categoryId }),
      ...(weights?.easy !== undefined && { weightEasy: weights.easy }),
      ...(weights?.normal !== undefined && { weightNormal: weights.normal }),
      ...(weights?.hard !== undefined && { weightHard: weights.hard }),
    },
  });

  return NextResponse.json(toWordResponse(word));
}

// ワード削除 (DELETE /api/words/[id])
export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  const { id } = await params;

  await prisma.word.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
