import type { NextApiRequest, NextApiResponse } from 'next';
import { setCookie } from 'nookies';

export default function changeLangHandler(
  req: NextApiRequest,
  res: NextApiResponse,
): void {
  const { lang } = req.body;

  if (!lang) {
    res.status(400).json({ message: 'Language not provided' });

    return;
  }

  const validLocales = ['en', 'vi'] as const;
  if (!validLocales.includes(lang)) {
    res.status(400).json({ message: 'Invalid language' });

    return;
  }

  setCookie({ res }, 'lang', lang, {
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: '/',
  });

  res.status(200).json({ message: 'Language changed successfully' });
}
