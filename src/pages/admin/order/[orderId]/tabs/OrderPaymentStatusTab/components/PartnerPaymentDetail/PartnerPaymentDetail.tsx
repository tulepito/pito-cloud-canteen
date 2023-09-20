import Button from '@components/Button/Button';
import { parseThousandNumberToInteger } from '@helpers/format';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { OrderDetailThunks } from '@pages/admin/order/[orderId]/AdminManageOrder.slice';
import { generateSKU } from '@pages/admin/order/[orderId]/helpers/AdminOrderDetail';
import { User } from '@src/utils/data';
import { EPaymentType } from '@src/utils/enums';
import type { TUser } from '@src/utils/types';

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
  company: TUser;
  orderTitle: string;
  deliveryHour: string;
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
    company,
    orderTitle,
    deliveryHour,
  } = props;
  const addPaymentModalController = useBoolean();
  const dispatch = useAppDispatch();
  const companyUser = User(company);
  const { companyName } = companyUser.getPublicData();

  const createPartnerPaymentRecordInProgress = useAppSelector(
    (state) => state.AdminManageOrder.createPartnerPaymentRecordInProgress,
  );
  const createPartnerPaymentRecordError = useAppSelector(
    (state) => state.AdminManageOrder.createPartnerPaymentRecordError,
  );
  const deletePartnerPaymentRecordInProgress = useAppSelector(
    (state) => state.AdminManageOrder.deletePartnerPaymentRecordInProgress,
  );
  const addPaymentDisabled = totalWithVAT === paidAmount;

  const handleAddPartnerPaymentRecord = async (
    values: TAddingPaymentRecordFormValues,
  ) => {
    const { paymentAmount, paymentNote } = values;

    const { meta } = await dispatch(
      OrderDetailThunks.createPartnerPaymentRecord({
        paymentType: EPaymentType.PARTNER,
        orderId,
        partnerId,
        subOrderDate,
        amount: parseThousandNumberToInteger(paymentAmount),
        paymentNote,
        partnerName,
        companyName,
        orderTitle,
        totalPrice: totalWithVAT,
        deliveryHour,
        SKU: generateSKU('PARTNER', orderId),
      }),
    );

    if (meta.requestStatus === 'fulfilled') {
      addPaymentModalController.setFalse();
    } else {
      dispatch(OrderDetailThunks.fetchPartnerPaymentRecords(orderId));
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
        error={createPartnerPaymentRecordError}
      />
    </div>
  );
};

export default PartnerPaymentDetail;
