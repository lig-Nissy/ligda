import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";

// メンバー更新 (PUT /api/members/[id])
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { name, nameReading, nickname, nicknameReading, photoData } = body;

  const member = await prisma.member.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(nameReading !== undefined && { nameReading }),
      ...(nickname !== undefined && { nickname: nickname || null }),
      ...(nicknameReading !== undefined && { nicknameReading: nicknameReading || null }),
      ...(photoData !== undefined && { photoData }),
    },
  });

  return NextResponse.json({
    id: member.id,
    name: member.name,
    nameReading: member.nameReading,
    nickname: member.nickname,
    nicknameReading: member.nicknameReading,
    photoData: member.photoData,
    createdAt: member.createdAt.toISOString(),
    updatedAt: member.updatedAt.toISOString(),
  });
}

// メンバー削除 (DELETE /api/members/[id])
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.member.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
