import isEmpty from 'lodash/isEmpty';

import { EParticipantOrderStatus } from '@utils/enums';
import type { TObject, TUser } from '@utils/types';

import type { TAllTabData, TItemData } from './OrderDetailsTable.utils';
import { EOrderDetailsTableTab } from './OrderDetailsTable.utils';

const memberInfoReduceFn = (result: TObject, currentParticipant: TUser) => {
  const {
    id: { uuid },
    attributes: {
      email,
      profile: { displayName },
    },
  } = currentParticipant;

  return { ...result, [uuid]: { email, name: displayName, id: uuid } };
};

export const prepareDataForTabs = ({
  participantData,
  anonymousParticipantData,
  memberOrders,
  foodList,
}: {
  participantData: TUser[];
  anonymousParticipantData: TUser[];
  memberOrders: TObject;
  foodList: TObject;
}) => {
  const memberOrderList = Object.entries<TObject>(memberOrders);

  const memberInfoMap = participantData.reduce<TObject>(memberInfoReduceFn, {});
  const anonymousMemberInfoMap = anonymousParticipantData.reduce<TObject>(
    memberInfoReduceFn,
    {},
  );

  const data = memberOrderList.reduce<TAllTabData>(
    (result, currentOrderItem) => {
      const {
        chose: choseList,
        notChoose: notChooseList,
        notJoined: notJoinedList,
        deleted: deletedList,
      } = result;

      const [memberId, orderItemData] = currentOrderItem;
      const { status, foodId, requirement = '' } = orderItemData;
      const memberData = memberInfoMap[memberId];

      const itemData: TItemData = {
        isAnonymous: isEmpty(memberData),
        memberData: memberData || anonymousMemberInfoMap[memberId],
        status,
        foodData:
          foodId?.length > 0 && foodList[foodId]
            ? { ...foodList[foodId], foodId, requirement }
            : {},
      };

      switch (status) {
        case EParticipantOrderStatus.joined:
          return { ...result, chose: [...choseList, itemData] };
        case EParticipantOrderStatus.notAllowed: {
          return { ...result, deleted: [...deletedList, itemData] };
        }
        case EParticipantOrderStatus.empty:
        case EParticipantOrderStatus.expired:
          return { ...result, notChoose: [...notChooseList, itemData] };
        case EParticipantOrderStatus.notJoined:
          return { ...result, notJoined: [...notJoinedList, itemData] };
        default:
          return result;
      }
    },
    {
      [EOrderDetailsTableTab.chose]: [],
      [EOrderDetailsTableTab.notChoose]: [],
      [EOrderDetailsTableTab.notJoined]: [],
      [EOrderDetailsTableTab.deleted]: [],
    },
  );

  return data;
};
