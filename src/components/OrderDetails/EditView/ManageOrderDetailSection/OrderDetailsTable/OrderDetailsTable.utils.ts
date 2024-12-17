import { EParticipantOrderStatus } from '@utils/enums';
import type { TListing, TObject } from '@utils/types';

export enum EOrderDetailsTableTab {
  chose = 'chose',
  notChoose = 'notChoose',
  notJoined = 'notJoined',
  deleted = 'deleted',
}

export const TABLE_TABS = {
  [EOrderDetailsTableTab.chose]: {
    id: 'OrderDetailsTable.tab.chose',
    value: EOrderDetailsTableTab.chose,
  },
  [EOrderDetailsTableTab.notChoose]: {
    id: 'OrderDetailsTable.tab.notChoose',
    value: EOrderDetailsTableTab.notChoose,
  },
  [EOrderDetailsTableTab.notJoined]: {
    id: 'OrderDetailsTable.tab.notJoin',
    value: EOrderDetailsTableTab.notJoined,
  },
};

export const SELECTED_TABLE_HEAD_IDS = [
  'OrderDetailsTable.head.name',
  'OrderDetailsTable.head.email',
  'OrderDetailsTable.head.selectedFood',
  'OrderDetailsTable.head.price',
];

export type TItemData = {
  isAnonymous: boolean;
  memberData: {
    id: string;
    name: string;
    email: string;
  };
  foodData: {
    foodId?: string;
    foodName?: string;
    foodPrice?: string;
  };
  status: EParticipantOrderStatus;
};

export type TAllTabData = TObject<EOrderDetailsTableTab, TItemData[]>;

export const checkShouldShowEditOrderWarningModal = (
  planData: TListing,
  currentViewDate: number,
  memberId: string,
  currentOrderDetail: TObject,
  shouldShowOverflowError?: boolean,
  minQuantity: number = 0,
) => {
  const { memberOrders: currentMemberOrders = {} } = currentOrderDetail || {};

  const currentPickedMemberLength = Object.keys(currentMemberOrders).filter(
    (f) => currentMemberOrders[f].status === EParticipantOrderStatus.joined,
  ).length;

  if (currentPickedMemberLength - 1 < minQuantity) {
    return { condition: true, type: 'reach_min' };
  }
  const { orderDetail = {} } = planData.attributes.metadata;
  const { memberOrders = {} } = orderDetail[currentViewDate] || {};
  const defaultChoseData = Object.keys(memberOrders).filter(
    (f) => memberOrders[f].status === EParticipantOrderStatus.joined,
  );

  const deletedData = Object.keys(currentMemberOrders).filter(
    (f) => currentMemberOrders[f].status === EParticipantOrderStatus.notAllowed,
  );

  const totalMemberCanRemove = Math.round((defaultChoseData.length * 10) / 100);

  const notAllowToEdit = deletedData.length >= totalMemberCanRemove;

  const memberInChoseTab = defaultChoseData.includes(memberId);

  if (shouldShowOverflowError && !memberInChoseTab) {
    return {
      condition: false,
    };
  }

  if (!memberInChoseTab && notAllowToEdit) {
    return {
      condition: false,
    };
  }

  return { condition: notAllowToEdit, type: 'reach_max' };
};
