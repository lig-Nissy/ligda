import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";
import { Difficulty } from "@/types";

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

// ワード一覧取得 (GET /api/words?categoryId=xxx&difficulty=normal)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const categoryId = searchParams.get("categoryId");
  const difficulty = searchParams.get("difficulty") as Difficulty | null;
  const weighted = searchParams.get("weighted") === "true";

  const where = categoryId ? { categoryId } : {};

  const words = await prisma.word.findMany({
    where,
    orderBy: { createdAt: "asc" },
  });

  // 重み付け取得の場合
  if (weighted && difficulty) {
    const weightedWords: typeof words = [];
    for (const word of words) {
      const weight =
        difficulty === "easy"
          ? word.weightEasy
          : difficulty === "normal"
            ? word.weightNormal
            : word.weightHard;
      for (let i = 0; i < weight; i++) {
        weightedWords.push(word);
      }
    }
    // 重み0のワードしかない場合は全ワードを返す
    const result = weightedWords.length > 0 ? weightedWords : words;
    return NextResponse.json(result.map(toWordResponse));
  }

  return NextResponse.json(words.map(toWordResponse));
}

// ワード追加 (POST /api/words)
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { text, reading, inputType, categoryId, weights } = body;

  if (!text || !reading || !categoryId) {
    return NextResponse.json(
      { error: "text, reading, and categoryId are required" },
      { status: 400 }
    );
  }

  const word = await prisma.word.create({
    data: {
      text,
      reading,
      inputType: inputType || "hiragana",
      categoryId,
      weightEasy: weights?.easy ?? 1,
      weightNormal: weights?.normal ?? 1,
      weightHard: weights?.hard ?? 1,
    },
  });

  return NextResponse.json(toWordResponse(word));
}

// ワード一括追加 (POST /api/words with array)
export async function PUT(request: NextRequest) {
  const body = await request.json();

  if (!Array.isArray(body)) {
    return NextResponse.json({ error: "Array expected" }, { status: 400 });
  }

  const words = await prisma.word.createMany({
    data: body.map(
      (w: {
        text: string;
        reading: string;
        inputType?: string;
        categoryId: string;
        weights?: { easy?: number; normal?: number; hard?: number };
      }) => ({
        text: w.text,
        reading: w.reading,
        inputType: w.inputType || "hiragana",
        categoryId: w.categoryId,
        weightEasy: w.weights?.easy ?? 1,
        weightNormal: w.weights?.normal ?? 1,
        weightHard: w.weights?.hard ?? 1,
      })
    ),
  });

  return NextResponse.json({ count: words.count });
}
