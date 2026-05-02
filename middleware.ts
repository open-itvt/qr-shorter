import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const MAX_BODY_SIZE = 2 * 1024 * 1024; // 2 MB

export function middleware(request: NextRequest) {
  // Check Content-Length for API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const contentLength = request.headers.get("content-length");

    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
      return NextResponse.json(
        { error: "Request body too large. Maximum 2 MB." },
        { status: 413 },
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
