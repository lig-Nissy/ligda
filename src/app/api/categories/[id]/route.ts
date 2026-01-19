import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";

type Params = Promise<{ id: string }>;

// カテゴリ更新 (PUT /api/categories/[id])
export async function PUT(request: NextRequest, { params }: { params: Params }) {
  const { id } = await params;
  const body = await request.json();
  const { name, description } = body;

  const category = await prisma.category.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
    },
  });

  return NextResponse.json({
    id: category.id,
    name: category.name,
    description: category.description,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  });
}

// カテゴリ削除 (DELETE /api/categories/[id])
export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  const { id } = await params;

  // デフォルトカテゴリは削除不可
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  // カテゴリに属するワードをデフォルトカテゴリに移動
  // まずデフォルトカテゴリを取得（なければ作成）
  let defaultCategory = await prisma.category.findFirst({
    where: { name: "一般" },
  });

  if (!defaultCategory) {
    defaultCategory = await prisma.category.create({
      data: {
        name: "一般",
        description: "一般的な言葉",
      },
    });
  }

  // ワードを移動
  await prisma.word.updateMany({
    where: { categoryId: id },
    data: { categoryId: defaultCategory.id },
  });

  // カテゴリを削除
  await prisma.category.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
