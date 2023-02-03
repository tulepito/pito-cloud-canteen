import type { EParticipantOrderStatus } from '@utils/enums';
import type { TObject } from '@utils/types';

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
  // 'OrderDetailsTable.head.other',
];

export type TItemData = {
  memberData: {
    id: string;
    name: string;
    email: string;
  };
  foodData:
    | {
        foodId: string;
        foodName: string;
        foodPrice: string;
      }
    | {};
  status: EParticipantOrderStatus;
};

export type TAllTabData = TObject<EOrderDetailsTableTab, TItemData[]>;
