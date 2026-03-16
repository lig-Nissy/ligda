import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";

function toMemberResponse(member: {
  id: string;
  name: string;
  nameReading: string;
  nickname: string | null;
  nicknameReading: string | null;
  photoData: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: member.id,
    name: member.name,
    nameReading: member.nameReading,
    nickname: member.nickname,
    nicknameReading: member.nicknameReading,
    photoData: member.photoData,
    createdAt: member.createdAt.toISOString(),
    updatedAt: member.updatedAt.toISOString(),
  };
}

// メンバー一覧取得 (GET /api/members)
export async function GET() {
  const members = await prisma.member.findMany({
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(members.map(toMemberResponse));
}

// メンバー追加 (POST /api/members)
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, nameReading, nickname, nicknameReading, photoData } = body;

  if (!name || !nameReading || !photoData) {
    return NextResponse.json(
      { error: "name, nameReading, and photoData are required" },
      { status: 400 }
    );
  }

  const member = await prisma.member.create({
    data: {
      name,
      nameReading,
      nickname: nickname || null,
      nicknameReading: nicknameReading || null,
      photoData,
    },
  });

  return NextResponse.json(toMemberResponse(member));
}
