import type { CookieSerializeOptions } from 'cookie';
import { serialize } from 'cookie';
import type { NextApiHandler, NextApiRequest } from 'next';

/**
 * This sets `cookie` on `res` object
 */
const cookie = (
  res: any,
  name: string,
  value: string,
  options: CookieSerializeOptions,
) => {
  const stringValue =
    typeof value === 'object' ? `j:${JSON.stringify(value)}` : String(value);
  res.setHeader('Set-Cookie', serialize(name, String(stringValue), options));
};

/**
 * Adds `cookie` function on `res.cookie` to set cookies for response
 */
const cookies =
  (handler: NextApiHandler) => (req: NextApiRequest, res: any) => {
    // eslint-disable-next-line no-param-reassign
    res.cookie = (
      name: string,
      value: string,
      options: CookieSerializeOptions,
    ) => cookie(res, name, value, options);

    return handler(req, res);
  };

export default cookies;
