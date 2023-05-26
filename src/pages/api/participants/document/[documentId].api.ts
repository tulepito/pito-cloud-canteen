import type { NextApiRequest, NextApiResponse } from 'next';

import cookies from '@services/cookie';
import { handleError } from '@services/sdk';

import { getFirebaseDocumentById } from './document.service';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { documentId } = req.query;
  try {
    const document = await getFirebaseDocumentById(documentId as string);

    res.json(document);
  } catch (error) {
    handleError(res, error);
  }
}

export default cookies(handler);
