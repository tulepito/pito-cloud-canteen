import { DateTime } from 'luxon';

import Button from '@components/Button/Button';
import Modal from '@components/Modal/Modal';
import NamedLink from '@components/NamedLink/NamedLink';
import { type TColumn, TableForm } from '@components/Table/Table';
import { convertHHmmStringToTimeParts } from '@helpers/dateHelpers';
import { parseThousandNumber } from '@helpers/format';
import { calculateSubOrderPrice } from '@helpers/orderHelper';
import { partnerPaths } from '@src/paths';
import { formatTimestamp } from '@src/utils/dates';
import { EOrderDraftStates, EOrderType } from '@src/utils/enums';
import type { TObject } from '@src/utils/types';

import css from './InProgressOrdersModal.module.css';

const TABLE_COLUMN: TColumn[] = [
  {
    key: 'id',
    label: 'ID',
    render: ({ id, date, subOrderTitle }: any) => {
      const titleComponent = (
        <div className={css.orderTitle}>#{subOrderTitle}</div>
      );

      return (
        <NamedLink
          path={partnerPaths.SubOrderDetail}
          params={{
            subOrderId: `${id}_${date}`,
          }}>
          {titleComponent}
        </NamedLink>
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
    key: 'time',
    label: 'Thời gian',
    render: (data: any) => {
      const { date, deliveryHour } = data;

      return date ? (
        <div className={css.rowText}>
          <div className={css.deliveryHour}>{deliveryHour}</div>
          {formatTimestamp(Number(date))}
        </div>
      ) : (
        <></>
      );
    },
    sortable: true,
  },
  {
    key: 'totalPrice',
    label: 'Tổng tiền',
    render: ({ totalPrice }: TObject) => {
      return totalPrice ? (
        <div className={css.totalPrice}>{totalPrice}</div>
      ) : (
        <></>
      );
    },
  },
];

const parseEntitiesToTableData = (subOrders: TObject[]) => {
  return subOrders.map((entity) => {
    const {
      orderId,
      date,
      companyName,
      orderTitle,
      orderType = EOrderType.group,
      staffName,
      startDate,
      endDate,
      deliveryHour,
      memberOrders = {},
      restaurant,
      lineItems = [],
      transaction,
      isPaid,
    } = entity;
    const dayIndex = new Date(Number(date)).getDay();

    const { totalPrice } = calculateSubOrderPrice({
      orderType,
      data: {
        memberOrders,
        restaurant,
        lineItems,
      },
    });

    const subOrderTitle = `${orderTitle}-${dayIndex > 0 ? dayIndex : 7}`;
    const formattedDeliveryHour = `${deliveryHour}`;

    return {
      key: subOrderTitle,
      data: {
        id: orderId,
        date,
        subOrderTitle,
        totalPrice: `${parseThousandNumber(totalPrice)}đ`,
        companyName,
        orderName: `${companyName}_${formatTimestamp(date)}`,
        staffName,
        startDate: startDate ? formatTimestamp(startDate) : '',
        time: DateTime.fromMillis(Number(date || 0))
          .startOf('day')
          .plus({ ...convertHHmmStringToTimeParts(deliveryHour) })
          .toMillis(),
        endDate: endDate ? formatTimestamp(endDate) : '',
        state: EOrderDraftStates.pendingApproval,
        deliveryHour: formattedDeliveryHour,
        transaction,
        isPaid,
      },
    };
  });
};

type TInProgressOrdersModalProps = {
  isOpen: boolean;
  onClose: () => void;
  orders: any[];
};

const InProgressOrdersModal: React.FC<TInProgressOrdersModalProps> = (
  props,
) => {
  const { isOpen, onClose /* orders */ } = props;

  const tableData = parseEntitiesToTableData([]);

  return (
    <Modal
      id="InProgressOrdersModal"
      title="Danh sách đơn hàng"
      isOpen={isOpen}
      handleClose={onClose}
      containerClassName={css.container}>
      <div className={css.contentContainer}>
        <TableForm
          columns={TABLE_COLUMN}
          data={tableData}
          // pagination={pagination}
          paginationPath={partnerPaths.ManageOrders}
          shouldReplacePathWhenChangePage
          tableBodyCellClassName={css.bodyCell}
          tableHeadCellClassName={css.headCell}
          // handleSort={handleSort}
          // sortValue={sortValue}
          tableWrapperClassName={css.tableWrapper}
          tableClassName={css.table}
        />

        <Button variant="secondary" className={css.closeBtn} onClick={onClose}>
          Đóng
        </Button>
      </div>
    </Modal>
  );
};

export default InProgressOrdersModal;
