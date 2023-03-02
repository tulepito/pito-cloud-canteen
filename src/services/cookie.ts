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

const converCookieStringToObject = (cookieString: string) => {
  const output = cookieString?.split(/\s*;\s*/).reduce((acc, pair) => {
    const newPair = pair.split(/\s*=\s*/);
    const name = decodeURIComponent(newPair[0]);
    const value = decodeURIComponent(newPair.splice(1).join('='));

    if (name.includes('st-') && name.includes('-token')) {
      if (
        !name.includes(
          process.env.NEXT_PUBLIC_SHARETRIBE_SDK_CLIENT_ID as string,
        )
      ) {
        return acc;
      }
    }
    const newValues: any = {
      ...acc,
      [name]: value,
    };
    return newValues;
  }, {});
  return output;
};

const converObjectToCookieString = (object: any) => {
  const output = JSON.stringify(object);
  const cookieString = output
    .slice(1, output.length - 2)
    .replaceAll('\\",\\"', '%22%2C%22')
    .replaceAll(',\\"', '%2C%22')
    .replaceAll('\\"', '%22')
    .replaceAll('"', '')
    .replaceAll(',', '; ')
    .replaceAll('%22:', '%22replaced')
    .replaceAll(':', '=')
    .replaceAll('%22replaced', '%22:');

  return cookieString;
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

    const output = converCookieStringToObject(req.headers.cookie || '');

    req.headers.cookie = converObjectToCookieString(output);
    return handler(req, res);
  };

export default cookies;
