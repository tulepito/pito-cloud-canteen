import type { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';

import { HttpMethod } from '@apis/configs';
import cookies from '@services/cookie';
import { denormalisedResponseEntities } from '@services/data';
import { setCollectionDocWithCustomId } from '@services/firebase';
import participantChecker from '@services/permissionChecker/participant';
import { getSdk } from '@services/sdk';
import type { TUpdateParticipantOrderBody } from '@src/types/order';
import {
  FailedResponse,
  HttpStatus,
  SuccessResponse,
} from '@src/utils/response';

const { NEXT_PUBLIC_FIREBASE_MEMBER_ORDERS_COLLECTION_NAME } = process.env;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const apiMethod = req.method;
  const sdk = getSdk(req, res);
  switch (apiMethod) {
    case HttpMethod.POST: {
      try {
        const { orderId } = req.query;
        const { planId, orderDays, planData } =
          req.body as TUpdateParticipantOrderBody;
        const currentUser = await sdk.currentUser.show();
        const [user] = denormalisedResponseEntities(currentUser);
        const participantId = user?.id?.uuid;
        if (!participantId) {
          return new FailedResponse({
            status: HttpStatus.UNAUTHORIZED,
            message: 'Unauthorized',
          }).send(res);
        }
        const order = await sdk.listings.show({ id: orderId as string });
        if (!order) {
          return new FailedResponse({
            status: HttpStatus.NOT_FOUND,
            message: 'Order not found',
          }).send(res);
        }
        const plan = await sdk.listings.show({ id: planId });
        if (!plan) {
          return new FailedResponse({
            status: HttpStatus.NOT_FOUND,
            message: 'Plan not found',
          }).send(res);
        }

        // add update plan to firestore
        const orderMemberDocumentId = uuidv4();
        try {
          await setCollectionDocWithCustomId(
            orderMemberDocumentId,
            {
              orderId,
              planId,
              participantId,
              planData,
              orderDays,
              status: 'pending',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            NEXT_PUBLIC_FIREBASE_MEMBER_ORDERS_COLLECTION_NAME!,
          );
        } catch (error) {
          return new FailedResponse({
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Failed to set order member document',
            error: error as string,
          }).send(res);
        }

        return new SuccessResponse({
          data: {
            orderMemberDocumentId,
          },
          message: 'Order placed successfully',
        }).send(res);
      } catch (error) {
        return new FailedResponse({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to place order',
          error: error as string,
        }).send(res);
      }
    }
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
};

export default cookies(participantChecker(handler));
