import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/libs/supabase/middleware";

const BASIC_AUTH_USER = process.env.BASIC_AUTH_USER ?? "lig";
const BASIC_AUTH_PASSWORD = process.env.BASIC_AUTH_PASSWORD ?? "LifeisGood";

function isAuthenticated(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Basic ")) {
    return false;
  }

  const encoded = authHeader.slice("Basic ".length).trim();
  let decoded: string;
  try {
    decoded = atob(encoded);
  } catch {
    return false;
  }

  const separatorIndex = decoded.indexOf(":");
  if (separatorIndex === -1) {
    return false;
  }

  const user = decoded.slice(0, separatorIndex);
  const password = decoded.slice(separatorIndex + 1);
  return user === BASIC_AUTH_USER && password === BASIC_AUTH_PASSWORD;
}

export async function middleware(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return new NextResponse("Authentication required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Restricted", charset="UTF-8"',
      },
    });
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
