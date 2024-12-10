import type { NextApiRequest, NextApiResponse } from 'next';

const APP_STORE_URL = 'https://apps.apple.com/app/id6448772497';
const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=io.gonative.android.eoxmjq';
const DEFAULT_REDIRECT_URL = 'https://cloudcanteen.pito.vn/dang-nhap/';

const getRedirectUrl = (userAgent: string): string => {
  if (/iphone|ipad|ipod/i.test(userAgent)) {
    return APP_STORE_URL;
  }
  if (/android/i.test(userAgent)) {
    return PLAY_STORE_URL;
  }

  return DEFAULT_REDIRECT_URL;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const userAgent = req.headers['user-agent'] || '';
  const redirectUrl = getRedirectUrl(userAgent);

  res.writeHead(302, { Location: redirectUrl });
  res.end();
};

export default handler;
