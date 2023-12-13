import { useState } from 'react';
import { DateTime } from 'luxon';

import Button from '@components/Button/Button';
import Modal from '@components/Modal/Modal';
import NamedLink from '@components/NamedLink/NamedLink';
import { type TColumn, TableForm } from '@components/Table/Table';
import { convertHHmmStringToTimeParts } from '@helpers/dateHelpers';
import { parseThousandNumber } from '@helpers/format';
import { partnerPaths } from '@src/paths';
import { formatTimestamp } from '@src/utils/dates';
import { EOrderDraftStates } from '@src/utils/enums';
import type { TObject, TTableSortValue } from '@src/utils/types';

import css from './InProgressOrdersModal.module.scss';

const TABLE_COLUMN: TColumn[] = [
  {
    key: 'subOrderId',
    label: 'ID',
    render: ({ id, subOrderDate, subOrderId }: any) => {
      const titleComponent = (
        <div className={css.orderTitle}>#{subOrderId}</div>
      );

      return (
        <NamedLink
          path={partnerPaths.SubOrderDetail}
          params={{
            subOrderId: `${id}_${subOrderDate}`,
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
      const { subOrderDate, deliveryHour } = data;

      return subOrderDate ? (
        <div className={css.rowText}>
          <div className={css.deliveryHour}>{deliveryHour}</div>
          {formatTimestamp(Number(subOrderDate))}
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

const parseEntitiesToTableData = (paymentRecords: TObject[]) => {
  return paymentRecords.map((entity) => {
    const {
      orderId,
      companyName,
      orderTitle,
      subOrderDate,
      deliveryHour,
      totalPrice = 0,
    } = entity;
    const dayIndex = new Date(Number(subOrderDate)).getDay();

    const subOrderId = `${orderTitle}-${dayIndex > 0 ? dayIndex : 7}`;
    const formattedDeliveryHour = `${deliveryHour}`;

    return {
      key: subOrderId,
      data: {
        id: orderId,
        orderName: `${companyName}_${formatTimestamp(subOrderDate)}`,
        subOrderId,
        totalPrice: `${parseThousandNumber(totalPrice)}đ`,
        companyName,
        time: DateTime.fromMillis(Number(subOrderDate || 0))
          .startOf('day')
          .plus({
            ...convertHHmmStringToTimeParts(deliveryHour.split('-')[0]),
          })
          .toMillis(),
        state: EOrderDraftStates.pendingApproval,
        deliveryHour: formattedDeliveryHour,
        subOrderDate,
      },
    };
  });
};

const sortOrders = ({ columnName, type }: TTableSortValue, data: any) => {
  const isAsc = type === 'asc';

  // eslint-disable-next-line array-callback-return
  return data.sort((a: any, b: any) => {
    if (columnName === 'time') {
      return isAsc ? a.data.time - b.data.time : b.data.time - a.data.time;
    }

    if (typeof a.data[columnName] === 'number') {
      return isAsc
        ? b.data[columnName] - a.data[columnName]
        : a.data[columnName] - b.data[columnName];
    }
    if (typeof a.data[columnName] === 'string') {
      if (a.data[columnName] < b.data[columnName]) {
        return isAsc ? -1 : 1;
      }
      if (a.data[columnName] > b.data[columnName]) {
        return isAsc ? 1 : -1;
      }

      return 0;
    }
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
  const { isOpen, onClose, orders } = props;

  const [sortValue, setSortValue] = useState<TTableSortValue>();

  const suitablePaymentRecords = orders.map(({ paymentRecord }) => {
    return paymentRecord;
  });
  const tableData = parseEntitiesToTableData(suitablePaymentRecords);
  const sortedData = sortValue ? sortOrders(sortValue, tableData) : tableData;

  const handleSort = (columnName: string) => {
    setSortValue({
      columnName,
      type: sortValue?.type === 'asc' ? 'desc' : 'asc',
    });
  };

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
          data={sortedData}
          // pagination={pagination}
          paginationPath={partnerPaths.ManageOrders}
          shouldReplacePathWhenChangePage
          tableBodyCellClassName={css.bodyCell}
          tableHeadCellClassName={css.headCell}
          handleSort={handleSort}
          sortValue={sortValue}
          tableWrapperClassName={css.tableWrapper}
          tableClassName={css.table}
        />

        <Button
          type="button"
          variant="secondary"
          className={css.closeBtn}
          onClick={onClose}>
          Đóng
        </Button>
      </div>
    </Modal>
  );
};

export default InProgressOrdersModal;
