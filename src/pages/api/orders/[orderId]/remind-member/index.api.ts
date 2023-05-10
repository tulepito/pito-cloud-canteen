import type { NextApiRequest, NextApiResponse } from 'next';

import cookies from '@services/cookie';
import { emailSendingFactory, EmailTemplateTypes } from '@services/email';
import { handleError } from '@services/sdk';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { description, uniqueMemberIdList } = req.body;

    const { orderId } = req.query;
    await Promise.all(
      uniqueMemberIdList.map(async (participantId: string) => {
        await emailSendingFactory(
          EmailTemplateTypes.PARTICIPANT.PARTICIPANT_ORDER_PICKING,
          {
            orderId,
            participantId,
            bookerNote: description,
          },
        );
      }),
    );

    res.json({
      statusCode: 200,
      message: `Successfully send email to members`,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export default cookies(handler);
