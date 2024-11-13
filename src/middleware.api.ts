import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  if (path === '/') {
    return NextResponse.rewrite('https://in.pito.vn/cloud-canteen/');
  }

  return NextResponse.next();
}
