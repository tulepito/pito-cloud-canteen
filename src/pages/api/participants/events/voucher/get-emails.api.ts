import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import cookies from '@services/cookie';
import { denormalisedResponseEntities } from '@services/data';
import { getDocumentById } from '@services/firebase';
import participantChecker from '@services/permissionChecker/participant';
import { getSdk, handleError } from '@services/sdk';
import { User } from '@src/utils/data';
import { SuccessResponse } from '@src/utils/response';

import type { VoucherInfo } from './receive.api';

const NEXT_PUBLIC_FIREBASE_EVENT_COLLECTION_NAME =
  process.env.NEXT_PUBLIC_FIREBASE_EVENT_COLLECTION_NAME;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const apiMethod = req.method;
  try {
    const sdk = getSdk(req, res);

    switch (apiMethod) {
      case HttpMethod.GET: {
        try {
          const currentUser = await sdk.currentUser.show();
          const [user] = denormalisedResponseEntities(currentUser);
          const userId = user?.id?.uuid;
          if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
          }
          const companyList = User(user).getMetadata().companyList || [];
          const companyId = companyList[0] || null;
          if (!companyId) {
            return res.status(400).json({ message: 'Company not found' });
          }
          const event = await getDocumentById(
            companyId,
            NEXT_PUBLIC_FIREBASE_EVENT_COLLECTION_NAME!,
          );
          if (!event) {
            return res.status(404).json({ message: 'Event not found' });
          }
          const vouchers = (
            event as unknown as { vouchers: Record<string, VoucherInfo> }
          ).vouchers as Record<string, VoucherInfo>;
          const emails = Object.values(vouchers).map(
            (voucher) => voucher.email,
          );
          if (!emails) {
            return res.status(404).json({ message: 'Emails not found' });
          }

          return new SuccessResponse(emails, {
            message: 'Lấy emails thành công',
          }).send(res);
        } catch (error) {
          console.error('Error in handler:', error);
          handleError(res, error);
        }
        break;
      }
      default:
        res.status(405).json({ message: 'Method not allowed' });
        break;
    }
  } catch (error) {
    console.error('Error in handler:', error);
    res.status(500).json({
      error: (error as Error).message,
      message: 'Internal server error',
    });
  }
};

export default cookies(participantChecker(handler));
