import { useEffect, useMemo, useState } from 'react';

import Badge, { EBadgeType } from '@components/Badge/Badge';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import type { TColumn } from '@components/Table/Table';
import Table from '@components/Table/Table';
import Tabs from '@components/Tabs/Tabs';
import { useAppDispatch } from '@hooks/reduxHooks';
import { AdminManageOrderThunks } from '@pages/admin/order/AdminManageOrder.slice';
import { Listing, User } from '@src/utils/data';
import { formatTimestamp } from '@src/utils/dates';
import { type EOrderStates, EQuotationStatus } from '@src/utils/enums';
import type { TListing, TPagination, TUser } from '@src/utils/types';

import OrderHeaderInfor from '../../components/OrderHeaderInfor/OrderHeaderInfor';
import OrderHeaderState from '../../components/OrderHeaderState/OrderHeaderState';
import OrderQuotationDetail from '../../components/OrderQuotationDetail/OrderQuotationDetail';

import css from './OrderQuotationTab.module.scss';

type OrderQuotationTabProps = {
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
    key: 'title',
    label: 'ID',
    render: ({ title, onQuotationDetail }: any) => {
      return (
        <div className={css.idLabel} onClick={onQuotationDetail}>
          {`BG${title}`}
        </div>
      );
    },
    sortable: true,
  },
  {
    key: 'orderName',
    label: 'Tên đơn hàng',
    render: ({ orderName }: any) => {
      return <div className={css.orderName}>{orderName || <></>}</div>;
    },
  },
  {
    key: 'address',
    label: 'Địa điểm',
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
    key: 'bookerName',
    label: 'Nguời đại diện',
    render: (data: any) => {
      return <div>{data.bookerName}</div>;
    },
  },
  {
    key: 'startDate',
    label: 'Thời gian',
    render: (data: any) => {
      const { startDate, endDate } = data;

      return startDate && endDate ? (
        <div className={css.rowText}>
          <div className={css.deliveryHour}>{data.deliveryHour}</div>
          {data.startDate} - {data.endDate}
        </div>
      ) : (
        <></>
      );
    },
    sortable: true,
  },
  {
    key: 'staffName',
    label: 'Nhân viên phụ trách',
    render: ({ staffName }: any) => {
      return staffName ? <div>{staffName}</div> : <></>;
    },
    sortable: true,
  },
  {
    key: 'status',
    label: 'Trạng thái',
    render: ({ status }: any) => {
      return (
        <Badge
          label={
            status === EQuotationStatus.ACTIVE ? 'Mới tạo' : 'Hết hiệu lực'
          }
          type={
            status === EQuotationStatus.ACTIVE
              ? EBadgeType.warning
              : EBadgeType.default
          }
        />
      );
    },
    sortable: true,
  },
];

const parseEntitiesToTableData = ({
  order,
  quotations,
  orderDetail,
  company,
  booker,
  setSelectedQuotation,
}: {
  order: TListing;
  quotations: TListing[];
  orderDetail: any;
  company: TUser;
  booker: TUser;
  setSelectedQuotation: (quotationId: string) => void;
}) => {
  if (quotations.length === 0) return [];
  const orderListing = Listing(order);
  const companyUser = User(company);
  const bookerUser = User(booker);
  const { startDate, endDate, staffName, deliveryAddress, deliveryHour } =
    orderListing.getMetadata();
  const { orderName } = orderListing.getPublicData();
  const { companyName } = companyUser.getPublicData();
  const { firstName, lastName } = bookerUser.getProfile();
  const restaurantsList = Object.values(orderDetail).reduce(
    (result: string[], orderDate: any) => {
      const { restaurant } = orderDate;

      return Array.from(new Set(result).add(restaurant.restaurantName));
    },
    [],
  );

  return quotations.map((quotation) => {
    const quotationListing = Listing(quotation);
    const { title: quotationTitle } = quotationListing.getAttributes();
    const quotationId = quotationListing.getId();
    const { status } = quotationListing.getMetadata();

    return {
      key: quotationId,
      data: {
        id: quotationId,
        title: quotationTitle,
        orderName,
        location: deliveryAddress?.address,
        staffName,
        companyName,
        bookerName: lastName + firstName,
        restaurants: restaurantsList,
        startDate: startDate && formatTimestamp(startDate),
        endDate: endDate && formatTimestamp(endDate),
        deliveryHour,
        status,
        onQuotationDetail: () => setSelectedQuotation(quotationListing.getId()),
      },
    };
  });
};

const getQuotationById = (quotations: TListing[], quotationId: string) => {
  return quotations.find((quotation) => {
    const quotationListing = Listing(quotation);

    return quotationListing.getId() === quotationId;
  });
};
const OrderQuotationTab: React.FC<OrderQuotationTabProps> = (props) => {
  const {
    order,
    orderDetail,
    updateOrderState,
    updateOrderStateInProgress,
    quotations,
    quotationsPagination,
    company,
    booker,
  } = props;
  const dispatch = useAppDispatch();

  const [selectedQuotation, setSelectedQuotation] = useState<any>(null);

  const quotation = useMemo(
    () => getQuotationById(quotations, selectedQuotation),
    [quotations, selectedQuotation],
  );

  const dataTable = parseEntitiesToTableData({
    order,
    quotations,
    orderDetail,
    company,
    booker,
    setSelectedQuotation,
  });

  const handleUpdateOrderState = (state: EOrderStates) => () => {
    updateOrderState(state);
  };
  const handleGoBack = () => {
    setSelectedQuotation(null);
  };

  useEffect(() => {
    if (order?.id.uuid) {
      dispatch(AdminManageOrderThunks.fetchQuotations(order?.id.uuid));
    }
  }, [dispatch, order?.id.uuid]);

  const targetTabItems = [
    {
      key: 'client',
      label: 'Báo giá khách hàng',
      childrenFn: () => {
        return (
          <>
            <OrderHeaderInfor
              company={company}
              booker={booker}
              order={order}
              updateStaffNameDisabled
              containerClassName={css.orderHeaderInforContainer}
            />
            <OrderQuotationDetail
              order={order}
              orderDetail={orderDetail}
              target="client"
              quotation={quotation!}
              company={company}
              booker={booker}
            />
          </>
        );
      },
    },
    {
      key: 'partner',
      label: 'Báo giá đối tác',
      childrenFn: () => {
        return (
          <>
            <OrderHeaderInfor
              company={company}
              booker={booker}
              order={order}
              updateStaffNameDisabled
              containerClassName={css.orderHeaderInforContainer}
            />
            <OrderQuotationDetail
              quotation={quotation!}
              orderDetail={orderDetail}
              order={order}
              target="partner"
              company={company}
              booker={booker}
            />
          </>
        );
      },
    },
  ];

  return (
    <div className={css.container}>
      <OrderHeaderState
        order={order}
        handleUpdateOrderState={handleUpdateOrderState}
        updateOrderStateInProgress={updateOrderStateInProgress}
        isAdminFlow
      />
      <RenderWhen condition={!selectedQuotation}>
        <div className={css.quotationWrapper}>
          <Table
            columns={TABLE_COLUMNS}
            data={dataTable}
            pagination={quotationsPagination}
            tableWrapperClassName={css.tableWrapper}
            tableClassName={css.table}
            tableHeadCellClassName={css.tableHeadCell}
            tableBodyCellClassName={css.tableBodyCell}
          />
        </div>
        <RenderWhen.False>
          <div>
            <div className={css.goBack} onClick={handleGoBack}>
              <IconArrow direction="left" />
              <span>Quay lại</span>
            </div>
            <div className={css.targetTabsWrapper}>
              <Tabs items={targetTabItems as any} />
            </div>
          </div>
        </RenderWhen.False>
      </RenderWhen>
    </div>
  );
};

export default OrderQuotationTab;
