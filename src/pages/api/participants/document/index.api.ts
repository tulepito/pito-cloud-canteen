import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import cookies from '@services/cookie';
import { queryCollectionData } from '@services/firebase';
import { fetchListing } from '@services/integrationHelper';
import { handleError } from '@services/sdk';
import { Listing } from '@src/utils/data';
import { EImageVariants, EParticipantOrderStatus } from '@src/utils/enums';

import {
  addFirebaseDocument,
  updateFirebaseDocument,
} from './document.service';

const { FIREBASE_PARTICIPANT_SUB_ORDER_COLLECTION_NAME } = process.env;

export interface GETParticipantsDocumentJSONParams {
  txStatus: string | string[];
  limitRecords: number;
  lastRecord: number | null;
  participantId: string;
  extraQueryParams?: Record<string, any>;
}

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const apiMethod = req.method;
  switch (apiMethod) {
    case HttpMethod.GET:
      try {
        const { JSONParams } = req.query;
        const {
          txStatus,
          limitRecords,
          lastRecord,
          participantId,
          extraQueryParams,
        } = JSON.parse(String(JSONParams)) as GETParticipantsDocumentJSONParams;

        const response = await queryCollectionData({
          collectionName: FIREBASE_PARTICIPANT_SUB_ORDER_COLLECTION_NAME!,
          queryParams: {
            participantId: {
              operator: '==',
              value: participantId,
            },
            txStatus: {
              operator: 'in',
              value: Array.isArray(txStatus) ? txStatus : [txStatus],
            },
            status: {
              operator: '==',
              value: EParticipantOrderStatus.joined,
            },
            ...(extraQueryParams || {}),
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
        const { foodId, secondaryFoodId } = params;
        let foodName = '';
        let foodImage = null;
        let secondaryFoodName = '';
        let secondaryFoodImage = null;
        if (foodId) {
          const foodResponse = await fetchListing(
            foodId,
            ['images'],
            [`variants.${EImageVariants.squareSmall2x}`],
          );
          const foodListing = Listing(foodResponse);
          const newFoodImages = foodListing.getImages();
          foodName = foodListing.getAttributes().title;

          foodImage =
            newFoodImages.length > 0
              ? {
                  ...newFoodImages[0],
                  id: {
                    uuid: newFoodImages[0].id.uuid,
                  },
                }
              : null;
        }
        if (secondaryFoodId) {
          const secondaryFoodResponse = await fetchListing(
            secondaryFoodId,
            ['images'],
            [`variants.${EImageVariants.squareSmall2x}`],
          );
          const secondaryFoodListing = Listing(secondaryFoodResponse);
          const newSecondaryFoodImages = secondaryFoodListing.getImages();
          secondaryFoodName = secondaryFoodListing.getAttributes().title;
          secondaryFoodImage =
            newSecondaryFoodImages.length > 0
              ? {
                  ...newSecondaryFoodImages[0],
                  id: {
                    uuid: newSecondaryFoodImages[0].id.uuid,
                  },
                }
              : null;
        }
        await updateFirebaseDocument(subOrderId!, {
          ...params,
          ...(foodImage && { foodImage }),
          ...(foodName && { foodName }),
          ...(secondaryFoodImage && { secondaryFoodImage }),
          ...(secondaryFoodName && { secondaryFoodName }),
        });
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
