import type { NextRequest } from 'next/server';
import { NextResponse, userAgent } from 'next/server';

import logger from '@helpers/logger';

function handleRewrite(req: NextRequest) {
  const { device } = userAgent(req);

  if (device.type === 'mobile') return NextResponse.next();

  return NextResponse.rewrite('https://in.pito.vn/cloud-canteen/');
}

async function handleLog(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const body = await req.text();
  const query = req.nextUrl.searchParams;

  let logData = {};

  if (body) {
    logData = { ...logData, body };
  }

  if (query.size > 0) {
    logData = { ...logData, query };
  }

  logger.info(
    `${req.method} - ${path}`,
    !Object.keys(logData).length ? '' : JSON.stringify(logData),
  );
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  if (path.startsWith('/api')) {
    handleLog(req);
  }

  if (path === '/') {
    return handleRewrite(req);
  }

  return NextResponse.next();
}
