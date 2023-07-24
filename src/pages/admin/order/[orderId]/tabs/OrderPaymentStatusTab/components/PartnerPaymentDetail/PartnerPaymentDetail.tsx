import Button from '@components/Button/Button';
import { parseThousandNumberToInteger } from '@helpers/format';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { generateSKU } from '@pages/admin/order/[orderId]/helpers/AdminOrderDetail';
import { OrderDetailThunks } from '@pages/admin/order/[orderId]/OrderDetail.slice';

import type { TAddingPaymentRecordFormValues } from '../AddingPaymentRecordForm/AddingPaymentRecordForm';
import AddingPaymentRecordModal from '../AddingPaymentRecordModal/AddingPaymentRecordModal';
import PaymentAmountTable from '../PaymentAmountTable/PaymentAmountTable';
import PaymentRecordTable from '../PaymentRecordTable/PaymentRecordTable';

import css from './PartnerPaymentDetail.module.scss';

type PartnerPaymentDetailProps = {
  partnerName: string;
  totalWithVAT: number;
  orderId: string;
  partnerId: string;
  subOrderDate: string;
  partnerPaymentRecordsByDate: any[];
  paidAmount: number;
};

const PartnerPaymentDetail: React.FC<PartnerPaymentDetailProps> = (props) => {
  const {
    partnerName,
    totalWithVAT,
    orderId,
    partnerId,
    subOrderDate,
    partnerPaymentRecordsByDate = [],
    paidAmount,
  } = props;
  const addPaymentModalController = useBoolean();
  const dispatch = useAppDispatch();

  const createPartnerPaymentRecordInProgress = useAppSelector(
    (state) => state.OrderDetail.createPartnerPaymentRecordInProgress,
  );
  const deletePartnerPaymentRecordInProgress = useAppSelector(
    (state) => state.OrderDetail.deletePartnerPaymentRecordInProgress,
  );
  const addPaymentDisabled = totalWithVAT === paidAmount;

  const handleAddPartnerPaymentRecord = async (
    values: TAddingPaymentRecordFormValues,
  ) => {
    const { paymentAmount, paymentNote } = values;

    const { meta } = await dispatch(
      OrderDetailThunks.createPartnerPaymentRecord({
        paymentType: 'partner',
        orderId,
        partnerId,
        subOrderDate,
        amount: parseThousandNumberToInteger(paymentAmount),
        paymentNote,
        SKU: generateSKU('CUSTOMER', orderId),
      }),
    );

    if (meta.requestStatus === 'fulfilled') {
      addPaymentModalController.setFalse();
    }
  };

  const handleDeletePartnerPaymentRecord = async (paymentRecordId: string) => {
    return dispatch(
      OrderDetailThunks.deletePartnerPaymentRecord(paymentRecordId),
    );
  };

  return (
    <div>
      <PaymentAmountTable
        tableTitle={partnerName}
        totalPrice={totalWithVAT}
        paidAmount={paidAmount}
      />
      <div className={css.buttonsWrapper}>
        <Button
          variant="secondary"
          onClick={addPaymentModalController.setTrue}
          disabled={addPaymentDisabled}>
          Thêm thanh toán
        </Button>
      </div>
      <div className={css.tableWrapper}>
        <PaymentRecordTable
          tableData={partnerPaymentRecordsByDate}
          onDeletePaymentRecord={handleDeletePartnerPaymentRecord}
          deleteInProgress={deletePartnerPaymentRecordInProgress}
        />
      </div>
      <AddingPaymentRecordModal
        isOpen={addPaymentModalController.value}
        handleClose={addPaymentModalController.setFalse}
        onPaymentSubmit={handleAddPartnerPaymentRecord}
        totalPrice={totalWithVAT}
        paidAmount={paidAmount}
        inProgress={createPartnerPaymentRecordInProgress}
      />
    </div>
  );
};

export default PartnerPaymentDetail;
