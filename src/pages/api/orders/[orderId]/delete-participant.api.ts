import cookies from '@services/cookie';
import type { NextApiRequest, NextApiResponse } from 'next';

// eslint-disable-next-line unused-imports/no-unused-vars
async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  // const integrationSdk = getIntegrationSdk();

  const apiMethod = req.method;
  switch (apiMethod) {
    case 'GET':
      break;
    case 'POST':
      break;
    case 'PUT':
      break;
    case 'DELETE':
      break;
    default:
      break;
  }
}

export default cookies(handler);
