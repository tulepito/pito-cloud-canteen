/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useMemo } from 'react';
import * as XLSX from 'xlsx';

import { isJoinedPlan } from '@helpers/order/orderPickingHelper';
import { currentUserSelector } from '@redux/slices/user.slice';
import type { UserListing } from '@src/types';
import { Listing } from '@src/utils/data';
import { formatTimestamp } from '@src/utils/dates';
import type { TListing, TObject, TUser } from '@src/utils/types';

import { useAppSelector } from './reduxHooks';

type ExportOrderDetailsExtendedField = 'company-name' | 'partner-name';
type ExportOrderDetailsExtendedFields = ExportOrderDetailsExtendedField[];

type Row = {
  Ngày: string;
  Tên: string;
  'Món ăn': string;
  'Đơn giá': number;
  'Ghi chú': string;
  'Tên công ty'?: string;
  'Tên đối tác'?: string;
};

type PrivateField = {
  Email: string;
};

const prepareData = ({
  orderDetail = {},
  participantData = {},
  extendedFields = [],
  options,
}: {
  orderDetail: TObject;
  participantData: TObject;
  extendedFields?: ExportOrderDetailsExtendedFields;
  options?: { privateFieldsIncludingIfAdmin?: boolean };
}) => {
  const { privateFieldsIncludingIfAdmin = false } = options ?? {};

  return Object.entries<TObject>(orderDetail).reduce<TObject[]>(
    (result, currentOrderDetailEntry) => {
      const [date, rawOrderDetailOfDate] = currentOrderDetailEntry;

      const { memberOrders = {}, restaurant = {} } = rawOrderDetailOfDate;
      const { foodList: foodListOfDate = {}, restaurantName } = restaurant;

      const orderData = Object.entries<TObject>(memberOrders).reduce<TObject[]>(
        (memberOrderResult, currentMemberOrderEntry) => {
          const [memberId, memberOrderData] = currentMemberOrderEntry;
          const { foodId, status, requirement } = memberOrderData;

          const newItem: Row & Partial<PrivateField> = {
            Ngày: formatTimestamp(Number(date)),
            Tên: participantData[memberId]?.name,
            ...(privateFieldsIncludingIfAdmin
              ? {
                  Email: participantData[memberId]?.email,
                }
              : {}),
            'Món ăn': foodListOfDate[foodId]?.foodName,
            'Đơn giá': foodListOfDate[foodId]?.foodPrice,
            'Ghi chú': requirement,
          };

          extendedFields.forEach((field) => {
            if (field === 'company-name') {
              newItem['Tên công ty'] = participantData[memberId]?.companyName;
            }

            if (field === 'partner-name') {
              newItem['Tên đối tác'] = restaurantName;
            }
          });

          return isJoinedPlan(foodId, status)
            ? memberOrderResult.concat([newItem])
            : memberOrderResult;
        },
        [],
      );

      const sortedOrderData = orderData.sort((a, b) => {
        if (a['Món ăn'] < b['Món ăn']) {
          return -1;
        }
        if (a['Món ăn'] > b['Món ăn']) {
          return 1;
        }

        return 0;
      });

      return [...result, ...sortedOrderData];
    },
    [],
  );
};

const useExportOrderDetails = (options?: {
  extendedFields?: ExportOrderDetailsExtendedFields;
}) => {
  const { extendedFields = [] } = options ?? {};
  const {
    orderData,
    draftOrderDetail,
    participantData,
    anonymousParticipantData,
  } = useAppSelector((state) => state.OrderManagement);
  const currentUser: UserListing = useAppSelector(currentUserSelector);

  const { participants = [], anonymous = [] } = Listing(
    orderData as TListing,
  ).getMetadata();

  const companyName = Listing(orderData as TListing).getMetadata()?.companyName;

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
            companyName,
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
              companyName,
            };
          }),
        ),
    [
      JSON.stringify(anonymous),
      JSON.stringify(anonymousParticipantData),
      JSON.stringify(participantData),
      JSON.stringify(participants),
    ],
  );

  const participantDataMap = useMemo(
    () =>
      participantDataList.reduce((res: TObject, curr: TObject) => {
        return { ...res, [curr.id]: curr };
      }, {}),
    [JSON.stringify(participantDataList)],
  );

  const handler = useCallback(() => {
    const preparedData = prepareData({
      orderDetail: draftOrderDetail,
      participantData: participantDataMap,
      extendedFields,
      options: {
        privateFieldsIncludingIfAdmin:
          currentUser.attributes?.profile?.metadata?.isAdmin,
      },
    });

    const { title } = Listing(orderData as TListing).getAttributes();

    const ws = XLSX.utils.json_to_sheet(preparedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'SheetJS');
    XLSX.writeFileXLSX(wb, `${title}.xlsx`, { type: 'binary' });
  }, [
    JSON.stringify(draftOrderDetail),
    JSON.stringify(participantDataMap),
    JSON.stringify(orderData),
    JSON.stringify(extendedFields),
  ]);

  return { handler };
};

export default useExportOrderDetails;
