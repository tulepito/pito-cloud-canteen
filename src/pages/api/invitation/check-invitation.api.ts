/* eslint-disable no-console */
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import cookies from '@services/cookie';
import { fetchUser } from '@services/integrationHelper';
import { getSdk, handleError } from '@services/sdk';
import { UserInviteStatus } from '@src/types/UserPermission';
import { denormalisedResponseEntities, USER } from '@utils/data';
import isEmpty from 'lodash/isEmpty';
import { DateTime } from 'luxon';
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const sdk = getSdk(req, res);

  try {
    const { companyId = '' } = req.body;

    const currentUser = denormalisedResponseEntities(
      await sdk.currentUser.show(),
    )[0];
    const userEmail = currentUser.attributes.email;
    const companyAccount = await fetchUser(companyId);
    const { members = {} } = USER(companyAccount).getMetadata();
    const userMember = members[userEmail];

    // Case user access to an invalid invitation
    if (isEmpty(userMember)) {
      return res.json({
        message: 'invalidInvitaion',
      });
    }

    const { expireTime = 0, inviteStatus } = userMember;
    const todayTimestamp = DateTime.now()
      .setZone('Asia/Ho_Chi_Minh')
      .toMillis();

    if (expireTime <= todayTimestamp) {
      return res.json({
        message: 'invitationExpired',
      });
    }

    switch (inviteStatus) {
      case UserInviteStatus.DECLINED:
        return res.json({
          message: 'invitationDeclinedBefore',
        });
      case UserInviteStatus.ACCEPTED:
        return res.json({
          message: 'redirectToCalendar',
        });
      case UserInviteStatus.NOT_ACCEPTED: {
        return res.json({
          message: 'showInvitation',
        });
      }

      default:
        return res.json({
          message: 'uncaught',
        });
    }
  } catch (error) {
    console.error('Check Invitation Error: ', error);
    handleError(res, error);
  }
}

export default cookies(handler);
