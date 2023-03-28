import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const dev = process.env.NODE_ENV === 'development';
  if (!dev) {
    const USERNAME = process.env.BASIC_AUTH_USERNAME;
    const PASSWORD = process.env.BASIC_AUTH_PASSWORD;
    const hasUsername = typeof USERNAME === 'string' && USERNAME.length > 0;
    const hasPassword = typeof PASSWORD === 'string' && PASSWORD.length > 0;
    // If BASIC_AUTH_USERNAME and BASIC_AUTH_PASSWORD have been set - let's use them
    if (hasUsername && hasPassword) {
      const basicAuth = req.headers.get('authorization');
      const url = req.nextUrl;

      if (basicAuth) {
        const authValues = basicAuth.split(' ')[1];
        const [username, password] = atob(authValues).split(':');

        if (!username || !password) {
          throw new Error(
            'Missing required username and password for basic authentication.',
          );
        }

        if (username === USERNAME && password === PASSWORD) {
          return NextResponse.next();
        }
      }

      url.pathname = '/api/auth/basic-auth';

      return NextResponse.rewrite(url);
    }
  } else {
    return NextResponse.next();
  }
}
