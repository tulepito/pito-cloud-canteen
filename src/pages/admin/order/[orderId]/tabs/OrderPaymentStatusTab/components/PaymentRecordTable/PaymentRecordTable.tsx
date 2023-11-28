import { useState } from 'react';

import Badge, { EBadgeType } from '@components/Badge/Badge';
import ConfirmationModal from '@components/ConfirmationModal/ConfirmationModal';
import IconDelete from '@components/Icons/IconDelete/IconDelete';
import type { TColumn } from '@components/Table/Table';
import Table from '@components/Table/Table';
import { parseThousandNumber } from '@helpers/format';
import useBoolean from '@hooks/useBoolean';
import { formatTimestamp } from '@src/utils/dates';

import css from './PaymentRecordTable.module.scss';

type PaymentRecordTableProps = {
  tableData: any[];
  onDeletePaymentRecord: (paymentRecordId: string) => Promise<any>;
  deleteInProgress: boolean;
};

const PaymentRecordTable: React.FC<PaymentRecordTableProps> = (props) => {
  const { tableData, onDeletePaymentRecord, deleteInProgress } = props;
  const [selectedPaymentRecordId, setSelectedPaymentRecordId] =
    useState<string>('');
  const deletePaymentRecordModalController = useBoolean();

  const TABLE_COLUMN: TColumn[] = [
    {
      key: 'sku',
      label: 'Mã SKU',
      render: ({ SKU }: any) => <div>{SKU}</div>,
    },
    {
      key: 'amount',
      label: 'Số tiền',
      render: ({ amount = 0 }: any) => (
        <div>{parseThousandNumber(amount.toString())}đ</div>
      ),
    },
    {
      key: 'paymentNote',
      label: 'Ghi chú',
      render: ({ paymentNote }: any) => <div>{paymentNote}</div>,
    },
    {
      key: 'paymentStatus',
      label: 'Trạng thái',
      render: () => (
        <div>
          <Badge type={EBadgeType.success} label="Thành công" />
        </div>
      ),
    },
    {
      key: 'paymentCreatedAt',
      label: 'Ngày thanh toán',
      render: ({ createdAt }: any) => (
        <div>
          {formatTimestamp(createdAt.seconds * 1000, 'HH:mm dd/MM/yyyy')}
        </div>
      ),
    },
    {
      key: 'action',
      label: '',
      render: ({ id }: any) => {
        const onDeleteClick = (_id: string) => () => {
          setSelectedPaymentRecordId(_id);
          deletePaymentRecordModalController.setTrue();
        };

        return (
          <div onClick={onDeleteClick(id)}>
            <IconDelete className={css.deleteIcon} />
          </div>
        );
      },
    },
  ];

  const formattedTableData = tableData.map((record) => ({
    key: record.id,
    data: record,
  }));

  const handleDeletePaymentRecord = async () => {
    const { meta } = await onDeletePaymentRecord(selectedPaymentRecordId);
    if (meta.requestStatus === 'fulfilled') {
      deletePaymentRecordModalController.setFalse();
    }
  };

  return (
    <>
      <Table
        columns={TABLE_COLUMN}
        data={formattedTableData}
        tableHeadCellClassName={css.tableHeadCell}
      />
      <ConfirmationModal
        id="DeletePaymentRecordModal"
        isOpen={deletePaymentRecordModalController.value}
        onClose={deletePaymentRecordModalController.setFalse}
        title="Xóa thanh toán"
        description="Bạn có chắc chắn muốn xóa thanh toán này?"
        onConfirm={handleDeletePaymentRecord}
        confirmText="Xóa"
        onCancel={deletePaymentRecordModalController.setFalse}
        cancelText="Hủy"
        isConfirmButtonLoading={deleteInProgress}
      />
    </>
  );
};

export default PaymentRecordTable;
