import { useMemo } from 'react';
import * as XLSX from 'xlsx';

import { isJoinedPlan } from '@helpers/orderHelper';
import { Listing } from '@src/utils/data';
import { formatTimestamp } from '@src/utils/dates';
import type { TListing, TObject, TUser } from '@src/utils/types';

import { useAppSelector } from './reduxHooks';

const prepareData = ({
  orderDetail = {},
  participantData = {},
}: {
  orderDetail: TObject;
  participantData: TObject;
}) => {
  return Object.entries<TObject>(orderDetail).reduce<TObject[]>(
    (result, currentOrderDetailEntry) => {
      const [date, rawOrderDetailOfDate] = currentOrderDetailEntry;

      const { memberOrders = {}, restaurant = {} } = rawOrderDetailOfDate;
      const { foodList: foodListOfDate = {} } = restaurant;

      const orderData = Object.entries<TObject>(memberOrders).reduce<TObject[]>(
        (memberOrderResult, currentMemberOrderEntry) => {
          const [memberId, memberOrderData] = currentMemberOrderEntry;
          const { foodId, status, requirement } = memberOrderData;

          const newItem = {
            Ngày: formatTimestamp(Number(date)),
            Tên: participantData[memberId]?.name,
            'Món ăn': foodListOfDate[foodId]?.foodName,
            'Đơn giá': foodListOfDate[foodId]?.foodPrice,
            'Ghi chú': requirement,
          };

          return isJoinedPlan(foodId, status)
            ? memberOrderResult.concat([newItem])
            : memberOrderResult;
        },
        [],
      );

      return [...result, ...orderData];
    },
    [],
  );
};

const useExportOrderDetails = () => {
  const { orderData, planData, participantData, anonymousParticipantData } =
    useAppSelector((state) => state.OrderManagement);
  const { orderDetail = {} } = Listing(planData as TListing).getMetadata();

  const { participants = [], anonymous = [] } = Listing(
    orderData as TListing,
  ).getMetadata();

  const participantDataList = useMemo(
    () =>
      participants
        .map((pid: string) => {
          const participant = participantData.find(
            (p: TUser) => pid === p.id.uuid,
          );
          const { email } = participant?.attributes || {};
          const { lastName = '', firstName = '' } =
            participant?.attributes?.profile || {};

          return {
            id: pid,
            email,
            name: `${lastName} ${firstName}`,
          };
        })
        .concat(
          anonymous.map((pid: string) => {
            const participant = anonymousParticipantData.find(
              (p: TUser) => pid === p.id.uuid,
            );
            const { email } = participant?.attributes || {};
            const { lastName = '', firstName = '' } =
              participant?.attributes?.profile || {};

            return {
              id: pid,
              email,
              name: `${lastName} ${firstName}`,
            };
          }),
        ),
    [anonymous, anonymousParticipantData, participantData, participants],
  );

  const participantDataMap = useMemo(
    () =>
      participantDataList.reduce((res: TObject, curr: TObject) => {
        return { ...res, [curr.id]: curr };
      }, {}),
    [participantDataList],
  );

  const handler = () => {
    const preparedData = prepareData({
      orderDetail,
      participantData: participantDataMap,
    });

    const ws = XLSX.utils.json_to_sheet(preparedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'SheetJS');
    XLSX.writeFile(wb, `${formatTimestamp(new Date().getTime())}_Món_Ăn.xlsx`);
  };

  return { handler };
};

export default useExportOrderDetails;
