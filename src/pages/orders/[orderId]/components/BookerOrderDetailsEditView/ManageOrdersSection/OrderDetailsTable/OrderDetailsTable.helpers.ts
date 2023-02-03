import { USER } from '@utils/data';
import { EParticipantOrderStatus } from '@utils/enums';
import type { TObject, TUser } from '@utils/types';

import type { TAllTabData, TItemData } from './OrderDetailsTable.utils';
import { EOrderDetailsTableTab } from './OrderDetailsTable.utils';

export const prepareDataForTabs = ({
  participantData,
  memberOrders,
  foodList,
}: {
  participantData: TUser[];
  memberOrders: TObject;
  foodList: TObject;
}) => {
  const memberOrderList = Object.entries<TObject>(memberOrders);

  const memberInfoMap = participantData.reduce<TObject>(
    (result, currentParticipant: TUser) => {
      const {
        id: { uuid },
        attributes: {
          email,
          profile: { displayName },
        },
      } = currentParticipant;

      return { ...result, [uuid]: { email, name: displayName, id: uuid } };
    },
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
      const { status, foodId } = orderItemData;
      const memberData = memberInfoMap[memberId];

      const itemData: TItemData = {
        memberData,
        status,
        foodData:
          foodId?.length > 0 && foodList[foodId]
            ? { ...foodList[foodId], foodId }
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

export const isStranger = (memberId: string, participants: TUser[]) => {
  return (
    participants.findIndex((user) => USER(user).getId() === memberId) === -1
  );
};
