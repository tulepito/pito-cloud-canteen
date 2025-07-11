/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useMemo } from 'react';
import * as XLSX from 'xlsx';

import { isJoinedPlan } from '@helpers/order/orderPickingHelper';
import { currentUserSelector } from '@redux/slices/user.slice';
import type { UserListing } from '@src/types';
import { Listing } from '@src/utils/data';
import { formatTimestamp } from '@src/utils/dates';
import { buildFullName } from '@src/utils/emailTemplate/participantOrderPicking';
import type { TListing, TObject, TUser } from '@src/utils/types';

import { useAppSelector } from './reduxHooks';

type ExportOrderDetailsExtendedField = 'company-name' | 'partner-name';
type ExportOrderDetailsExtendedFields = ExportOrderDetailsExtendedField[];

type Row = {
  Ngày: string;
  Nhóm: string;
  Tên: string;
  Email: string;
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
            ...(participantData[memberId]?.groupName && {
              Nhóm: participantData[memberId]?.groupName,
            }),
            Tên: participantData[memberId]?.name,
            ...(privateFieldsIncludingIfAdmin
              ? {
                  Email: participantData[memberId]?.email,
                }
              : {}),
            ...(participantData[memberId]?.email && {
              Email: participantData[memberId]?.email,
            }),
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
        const groupA = a['Nhóm'] ?? '';
        const groupB = b['Nhóm'] ?? '';
        const dishA = a['Món ăn'] ?? '';
        const dishB = b['Món ăn'] ?? '';

        const groupCompare = groupA.localeCompare(groupB, 'vi');
        if (groupCompare !== 0) return groupCompare;

        return dishA.localeCompare(dishB, 'vi');
      });

      return [...result, ...sortedOrderData];
    },
    [],
  );
};

const getGroupNameByMemberId = (
  data: any[],
  memberId: string,
): string | null => {
  const group = data.find((item: TObject) =>
    item.members?.some((member: any) => member.id === memberId),
  );

  return group?.name?.trim() ?? null;
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
    companyData,
  } = useAppSelector((state) => state.OrderManagement);
  const currentUser: UserListing = useAppSelector(currentUserSelector);
  const groups = companyData?.attributes.profile.metadata?.groups || [];

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
          ) as UserListing | undefined;

          return {
            id: pid,
            email: participant?.attributes?.email,
            name: buildFullName(
              participant?.attributes?.profile?.firstName,
              participant?.attributes?.profile?.lastName,
              {
                compareToGetLongerWith:
                  participant?.attributes?.profile?.displayName,
              },
            ),
            companyName,
            ...(getGroupNameByMemberId(groups, pid) && {
              groupName: getGroupNameByMemberId(groups, pid),
            }),
          };
        })
        .concat(
          anonymous.map((pid: string) => {
            const participant = anonymousParticipantData.find(
              (p: TUser) => pid === p.id.uuid,
            );
            const { email } = participant?.attributes || {};
            const {
              lastName = '',
              firstName = '',
              displayName,
            } = participant?.attributes?.profile || {};

            return {
              id: pid,
              email,
              name: buildFullName(firstName, lastName, {
                compareToGetLongerWith: displayName,
              }),
              companyName,
              ...(getGroupNameByMemberId(groups, pid) && {
                groupName: getGroupNameByMemberId(groups, pid),
              }),
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
