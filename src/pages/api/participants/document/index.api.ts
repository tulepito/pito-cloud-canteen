import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import cookies from '@services/cookie';
import { queryCollectionData } from '@services/firebase';
import { handleError } from '@services/sdk';

import {
  addFirebaseDocument,
  updateFirebaseDocument,
} from './document.service';

const { FIREBASE_PARTICIPANT_SUB_ORDER_COLLECTION_NAME } = process.env;

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const apiMethod = req.method;
  switch (apiMethod) {
    case HttpMethod.GET:
      try {
        const { JSONParams } = req.query;
        const { txStatus, limitRecords, lastRecord, participantId } =
          JSON.parse(JSONParams as string);
        const response = await queryCollectionData({
          collectionName: FIREBASE_PARTICIPANT_SUB_ORDER_COLLECTION_NAME!,
          queryParams: {
            participantId: {
              operator: '==',
              value: participantId,
            },
            txStatus: {
              operator: '==',
              value: txStatus,
            },
          },
          limitRecords: Number(limitRecords),
          lastRecord: Number(lastRecord),
        });

        res.json(response);
      } catch (error) {
        handleError(res, error);
      }
      break;
    case HttpMethod.POST:
      try {
        const { participantId, planId, timestamp } = req.body;
        await addFirebaseDocument({
          participantId,
          planId,
          timestamp,
        });

        res.json({ message: 'Add document successfully' });
      } catch (error) {
        handleError(res, error);
      }
      break;
    case HttpMethod.PUT:
      try {
        const { subOrderId, params } = req.body;
        await updateFirebaseDocument(subOrderId!, params);
        res.json({ message: 'Update document successfully' });
      } catch (error) {
        handleError(res, error);
      }
      break;
    default: {
      break;
    }
  }
}

export default cookies(handler);
