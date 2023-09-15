import { CustomError, errorMessages } from '@apis/errors';
import { denormalisedResponseEntities } from '@services/data';
import { getIntegrationSdk } from '@services/integrationSdk';
import { CompanyPermission } from '@src/types/UserPermission';
import {
  EBookerOrderDraftStates,
  EOrderDraftStates,
  EOrderStates,
} from '@src/utils/enums';
import type { TObject } from '@src/utils/types';

const isBookerInOrderProgress = async ({
  members,
  memberEmail,
}: {
  members: TObject;
  memberEmail: string;
}) => {
  const updatingMember = members[memberEmail] || {};
  const updateMemberIsBooker = CompanyPermission.includes(
    updatingMember.permission,
  );

  const integrationSdk = getIntegrationSdk();
  if (updateMemberIsBooker && updatingMember?.id) {
    const response = await integrationSdk.listings.query({
      meta_bookerId: updatingMember?.id,
      page: 1,
      perPage: 1,
      meta_orderState: `${EBookerOrderDraftStates.bookerDraft},${EOrderStates.inProgress},${EOrderStates.picking},${EOrderDraftStates.draft},${EOrderDraftStates.pendingApproval}`,
    });
    const inProgressOrders = denormalisedResponseEntities(response);

    if (inProgressOrders.length > 0) {
      throw new CustomError(
        errorMessages.BOOKER_IN_ORDER_PROGRESS.message,
        errorMessages.BOOKER_IN_ORDER_PROGRESS.code,
        {
          errors: [
            {
              id: new Date().getTime(),
              status: errorMessages.BOOKER_IN_ORDER_PROGRESS.code,
              code: errorMessages.BOOKER_IN_ORDER_PROGRESS.id,
              title: errorMessages.BOOKER_IN_ORDER_PROGRESS.message,
            },
          ],
        },
      );
    }
  }
};

export default isBookerInOrderProgress;
