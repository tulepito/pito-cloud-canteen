import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import logger from '@helpers/logger';
import type { TLocale } from '@src/types/utils';

function handleRewrite(req: NextRequest, locale: TLocale) {
  const target = new URL(`/${locale}/website/`, req.url);

  return NextResponse.rewrite(target);
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

  if (path.startsWith('/api') && !path.startsWith('/api/upload')) {
    handleLog(req);
  }

  if (path === '/') {
    return handleRewrite(req, req.nextUrl.locale as TLocale);
  }

  return NextResponse.next();
}
