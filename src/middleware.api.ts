import type { NextRequest } from 'next/server';
import { NextResponse, userAgent } from 'next/server';

function handleRewrite(req: NextRequest) {
  const { device } = userAgent(req);

  if (device.type === 'mobile') return NextResponse.next();

  return NextResponse.rewrite('https://in.pito.vn/cloud-canteen/');
}

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  if (path === '/') {
    return handleRewrite(req);
  }

  return NextResponse.next();
}
