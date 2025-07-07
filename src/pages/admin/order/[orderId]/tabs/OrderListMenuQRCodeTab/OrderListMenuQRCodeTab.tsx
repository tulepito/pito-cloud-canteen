import { useEffect, useMemo } from 'react';

import type { TColumn } from '@components/Table/Table';
import Table from '@components/Table/Table';
import { isJoinedPlan } from '@helpers/order/orderPickingHelper';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { AdminManageOrderThunks } from '@pages/admin/order/AdminManageOrder.slice';
import { generateScannerBarCode } from '@pages/api/admin/scanner/[planId]/toggle-mode.api';
import type { PlanListing, UserListing } from '@src/types';
import { Listing } from '@src/utils/data';
import { buildFullName } from '@src/utils/emailTemplate/participantOrderPicking';
import { type EOrderStates } from '@src/utils/enums';
import type { TListing, TObject, TPagination, TUser } from '@src/utils/types';

import OrderHeaderState from '../../components/OrderHeaderState/OrderHeaderState';

import css from './OrderListMenuQRCodeTab.module.scss';

const prepareData = ({
  orderDetail = {},
  participantData = {},
  planId,
}: {
  orderDetail: TObject;
  participantData: TObject;
  planId: string;
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
            memberData: participantData[memberId],
            foodData: {
              requirement,
              foodId,
              ...foodListOfDate[foodId],
            },
            restaurant,
            barcode: generateScannerBarCode(planId, memberId, date),
          };

          return isJoinedPlan(foodId, status)
            ? memberOrderResult.concat([newItem])
            : memberOrderResult;
        },
        [],
      );

      return [
        ...result,
        {
          date,
          orderData,
        },
      ];
    },
    [],
  );
};

const prepareDataGroups = ({
  orderDetail = {},
  participantData = {},
  planId,
  groups = [],
}: {
  orderDetail: TObject;
  participantData: TObject;
  planId: string;
  groups: TObject[];
}): TObject[] => {
  return Object.entries<TObject>(orderDetail).reduce<TObject[]>(
    (result, [date, rawOrderDetailOfDate]) => {
      const { memberOrders = {}, restaurant = {} } = rawOrderDetailOfDate;
      const { foodList: foodListOfDate = {} } = restaurant;

      const participantMap = participantData as Record<string, TObject>;

      // Prepare order data grouped by defined groups
      const groupOrderData = groups
        .map((group) => {
          const { id: groupId, name: groupName, members = [] } = group;

          const memberIds = members.map((m: TObject) => m.id);
          const orderData = memberIds
            .map((memberId: string) => {
              const memberOrder = memberOrders[memberId];
              if (!memberOrder) return null;

              const { foodId, status, requirement } = memberOrder;
              if (!isJoinedPlan(foodId, status)) return null;

              return {
                memberData: participantMap[memberId],
                foodData: {
                  requirement,
                  foodId,
                  ...foodListOfDate[foodId],
                },
                restaurant,
                barcode: generateScannerBarCode(planId, memberId, date),
              };
            })
            .filter(Boolean)
            .sort((a: TObject, b: TObject) => {
              const foodNameA = a.foodData?.foodName || '';
              const foodNameB = b.foodData?.foodName || '';

              return foodNameA.localeCompare(foodNameB);
            });

          return {
            groupId,
            groupName,
            orderData,
          };
        })
        .sort((a, b) => {
          const groupNameA = a.groupName || '';
          const groupNameB = b.groupName || '';

          return groupNameA.localeCompare(groupNameB);
        });

      // Handle members not in any group
      const allGroupMemberIds = new Set(
        groups.flatMap((g) => g.members.map((m: TObject) => m.id)),
      );

      const orderDataForOthers = Object.entries<TObject>(memberOrders)
        .filter(([memberId]) => !allGroupMemberIds.has(memberId))
        .map(([memberId, memberOrderData]) => {
          const { foodId, status, requirement } = memberOrderData;
          if (!isJoinedPlan(foodId, status)) return null;

          return {
            memberData: participantMap[memberId],
            foodData: {
              requirement,
              foodId,
              ...foodListOfDate[foodId],
            },
            restaurant,
            barcode: generateScannerBarCode(planId, memberId, date),
          };
        })
        .filter(Boolean);

      return [
        ...result,
        {
          date,
          groupOrderData,
          orderDataForOthers,
        },
      ];
    },
    [],
  );
};

type OrderListMenuQRCodeTabProps = {
  order: TListing;
  orderDetail: any;
  company: TUser;
  booker: TUser;
  updateOrderState: (newOrderState: string) => void;
  updateOrderStateInProgress: boolean;
  quotations: TListing[];
  quotationsPagination: TPagination;
};

const TABLE_COLUMNS: TColumn[] = [
  {
    key: 'nameParticipant',
    label: 'Tên người tham gia',
    render: ({ orderName }: any) => {
      return <div className={css.orderName}>{orderName || <></>}</div>;
    },
  },
  {
    key: 'email',
    label: 'Email',
    render: (data: any) => {
      return (
        <div className={css.locationRow}>
          <div className={css.companyName}>{data.companyName}</div>
          {data.location || <></>}
        </div>
      );
    },
  },
  {
    key: 'code',
    label: 'Mã Code',
    render: (data: any) => {
      return <div>{data.bookerName}</div>;
    },
  },
];

const OrderListMenuQRCodeTab: React.FC<OrderListMenuQRCodeTabProps> = (
  props,
) => {
  const {
    order,
    updateOrderState,
    updateOrderStateInProgress,
    quotationsPagination,
    company,
    orderDetail,
  } = props;
  const dispatch = useAppDispatch();

  const { participants = [], anonymous = [] } = Listing(
    order as TListing,
  ).getMetadata();

  const groups = useMemo(
    () => company?.attributes?.profile?.metadata?.groups || [],
    [company],
  );

  // const isHasGroups = useMemo(() => groups.length > 0, [groups.length]);

  const planListing: PlanListing = useAppSelector(
    (state) => state.OrderManagement.planData,
  );

  const participantData = useAppSelector(
    (state) => state.OrderManagement.participantData,
  );

  const anonymousParticipantData = useAppSelector(
    (state) => state.OrderManagement.anonymousParticipantData,
  );

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
          };
        })
        .concat(
          anonymous.map((pid: string) => {
            const participant = anonymousParticipantData.find(
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

  console.log('planListing', planListing);

  // const dataTable = [{}];

  const preparedData = useMemo(
    () =>
      prepareData({
        orderDetail,
        participantData: participantDataMap,
        planId: planListing?.id?.uuid || '',
      }),
    [orderDetail, participantDataMap, planListing?.id?.uuid],
  );

  const preparedDataGroups = useMemo(
    () =>
      prepareDataGroups({
        orderDetail,
        participantData: participantDataMap,
        planId: planListing?.id?.uuid || '',
        groups: (groups || []).filter((g: TObject) => Boolean(g)),
      }),
    [orderDetail, participantDataMap, planListing?.id?.uuid, groups],
  );

  console.log({ preparedData, preparedDataGroups });

  const handleUpdateOrderState = (state: EOrderStates) => () => {
    updateOrderState(state);
  };

  useEffect(() => {
    if (order?.id.uuid) {
      dispatch(AdminManageOrderThunks.fetchQuotations(order?.id.uuid));
    }
  }, [dispatch, order?.id.uuid]);

  return (
    <div className={css.container}>
      <OrderHeaderState
        order={order}
        handleUpdateOrderState={handleUpdateOrderState}
        updateOrderStateInProgress={updateOrderStateInProgress}
        isAdminFlow
      />
      <div className={css.quotationWrapper}>
        <Table
          columns={TABLE_COLUMNS}
          data={[
            {
              data: {},
              key: '1',
            },
          ]}
          pagination={quotationsPagination}
          tableWrapperClassName={css.tableWrapper}
          tableClassName={css.table}
          tableHeadCellClassName={css.tableHeadCell}
          tableBodyCellClassName={css.tableBodyCell}
        />
      </div>
    </div>
  );
};

export default OrderListMenuQRCodeTab;
