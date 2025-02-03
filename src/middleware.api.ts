import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import logger from '@helpers/logger';

function handleRewrite() {
  return NextResponse.rewrite('https://in.pito.vn/cloud-canteen/');
}

async function handleLog(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const body = await req.text();
  const { search } = req.nextUrl;

  let logData = {};

  if (body) {
    logData = { ...logData, body };
  }

  if (search !== '?JSONParams=%7B%7D') {
    logData = {
      ...logData,
      searchParams: decodeURIComponent(search),
    };
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
    return handleRewrite();
  }

  return NextResponse.next();
}
