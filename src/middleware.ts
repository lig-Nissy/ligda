import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/libs/supabase/middleware";

function getClientIp(request: NextRequest): string | null {
  // Vercel/Cloudflare等のプロキシ経由の場合
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  return null;
}

function isAllowedIp(clientIp: string | null): boolean {
  const allowedIps = process.env.IP_ALLOWLIST;

  // 環境変数が設定されていない場合は全て許可
  if (!allowedIps) {
    return true;
  }

  // ローカル開発環境は許可（IP取得できない or localhost）
  if (!clientIp || clientIp === "::1" || clientIp === "127.0.0.1") {
    return true;
  }

  const allowedList = allowedIps.split(",").map((ip) => ip.trim());
  return allowedList.includes(clientIp);
}

export async function middleware(request: NextRequest) {
  // IP制限チェック
  const clientIp = getClientIp(request);
  if (!isAllowedIp(clientIp)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // /admin配下はセッション更新も行う
  if (request.nextUrl.pathname.startsWith("/admin")) {
    return await updateSession(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/).*)"],
};
