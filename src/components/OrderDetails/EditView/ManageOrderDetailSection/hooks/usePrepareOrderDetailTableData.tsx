/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo } from 'react';
import { useIntl } from 'react-intl';

import { useAppSelector } from '@hooks/reduxHooks';
import { Listing } from '@utils/data';
import type { TListing } from '@utils/types';

import { prepareDataForTabs } from '../OrderDetailsTable/OrderDetailsTable.helpers';
import type { TAllTabData } from '../OrderDetailsTable/OrderDetailsTable.utils';
import {
  EOrderDetailsTableTab,
  SELECTED_TABLE_HEAD_IDS,
} from '../OrderDetailsTable/OrderDetailsTable.utils';

export const usePrepareOrderDetailTableData = (
  currentViewDate: number | string,
) => {
  const intl = useIntl();
  const { participantData, anonymousParticipantData, orderData, orderDetail } =
    useAppSelector((state) => state.OrderManagement);

  const { packagePerMember = 0 } = Listing(orderData as TListing).getMetadata();

  const { restaurant = {}, memberOrders = {} } =
    orderDetail[currentViewDate?.toString()] || {};
  const { foodList = {} } = restaurant;

  const tableHeads = useMemo(
    () => SELECTED_TABLE_HEAD_IDS.map((id) => intl.formatMessage({ id })),
    [],
  );

  const allTabData: TAllTabData = useMemo(
    () =>
      prepareDataForTabs({
        anonymousParticipantData,
        participantData,
        memberOrders,
        foodList,
      }),
    [
      JSON.stringify(anonymousParticipantData),
      JSON.stringify(participantData),
      JSON.stringify(memberOrders),
      JSON.stringify(foodList),
    ],
  );

  return {
    packagePerMember,
    allTabData,
    tableHeads,
    deletedTabData: allTabData[EOrderDetailsTableTab.deleted],
    currentOrderDetail: orderDetail[currentViewDate],
  };
};
