import { CustomError } from '@apis/errors';
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
      meta_orderState: `has_any:${EBookerOrderDraftStates.bookerDraft},${EOrderStates.inProgress},${EOrderStates.picking},${EOrderDraftStates.draft},${EOrderDraftStates.pendingApproval}`,
    });
    const inProgressOrders = denormalisedResponseEntities(response);
    if (inProgressOrders.length > 0) {
      throw new CustomError('Conflict', 409, {
        message: 'Không thể xoá, booker đang tham gia order',
      });
    }
  }
};

export default isBookerInOrderProgress;
