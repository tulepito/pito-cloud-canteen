import Button from '@components/Button/Button';
import { parseThousandNumberToInteger } from '@helpers/format';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { generateSKU } from '@pages/admin/order/[orderId]/helpers/AdminOrderDetail';
import { OrderDetailThunks } from '@pages/admin/order/[orderId]/OrderDetail.slice';
import { User } from '@src/utils/data';
import { EPaymentType } from '@src/utils/enums';
import type { TUser } from '@src/utils/types';

import type { TAddingPaymentRecordFormValues } from '../AddingPaymentRecordForm/AddingPaymentRecordForm';
import AddingPaymentRecordModal from '../AddingPaymentRecordModal/AddingPaymentRecordModal';
import PaymentAmountTable from '../PaymentAmountTable/PaymentAmountTable';
import PaymentRecordTable from '../PaymentRecordTable/PaymentRecordTable';

import css from './ClientPaymentDetail.module.scss';

type ClientPaymentDetailProps = {
  totalWithVAT: number;
  orderId: string;
  clientPaymentRecords: any[];
  paidAmount: number;
  company: TUser;
  orderTitle: string;
  deliveryHour: string;
};

const ClientPaymentDetail: React.FC<ClientPaymentDetailProps> = (props) => {
  const {
    totalWithVAT,
    orderId,
    clientPaymentRecords = [],
    paidAmount,
    company,
    orderTitle,
    deliveryHour,
  } = props;

  const dispatch = useAppDispatch();
  const addPaymentModalController = useBoolean();

  const createClientPaymentRecordInProgress = useAppSelector(
    (state) => state.OrderDetail.createClientPaymentRecordInProgress,
  );
  const deleteClientPaymentRecordInProgress = useAppSelector(
    (state) => state.OrderDetail.deleteClientPaymentRecordInProgress,
  );

  const companyUser = User(company);
  const { companyName } = companyUser.getPublicData();
  const addPaymentDisabled = totalWithVAT === paidAmount;

  const onAddClientPaymentRecord = async (
    values: TAddingPaymentRecordFormValues,
  ) => {
    const { paymentAmount, paymentNote } = values;

    const { meta } = await dispatch(
      OrderDetailThunks.createClientPaymentRecord({
        paymentType: EPaymentType.CLIENT,
        orderId,
        amount: parseThousandNumberToInteger(paymentAmount),
        paymentNote,
        companyName,
        orderTitle,
        totalPrice: totalWithVAT,
        deliveryHour,
        SKU: generateSKU('CUSTOMER', orderId),
      }),
    );

    if (meta.requestStatus === 'fulfilled') {
      addPaymentModalController.setFalse();
    }
  };

  const handleDeleteClientPaymentRecord = async (paymentRecordId: string) => {
    return dispatch(
      OrderDetailThunks.deleteClientPaymentRecord(paymentRecordId),
    );
  };

  return (
    <div>
      <PaymentAmountTable totalPrice={totalWithVAT} paidAmount={paidAmount} />
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
          tableData={clientPaymentRecords}
          onDeletePaymentRecord={handleDeleteClientPaymentRecord}
          deleteInProgress={deleteClientPaymentRecordInProgress}
        />
      </div>
      <AddingPaymentRecordModal
        isOpen={addPaymentModalController.value}
        handleClose={addPaymentModalController.setFalse}
        onPaymentSubmit={onAddClientPaymentRecord}
        totalPrice={totalWithVAT}
        paidAmount={paidAmount}
        inProgress={createClientPaymentRecordInProgress}
        paymentType={EPaymentType.CLIENT}
      />
    </div>
  );
};

export default ClientPaymentDetail;
