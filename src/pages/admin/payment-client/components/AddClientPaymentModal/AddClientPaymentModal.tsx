import { useRef } from 'react';

import Modal from '@components/Modal/Modal';
import type { TCompanyMemberWithDetails, TObject } from '@src/utils/types';

import AddClientPaymentForm from '../AddClientPaymentForm/AddClientPaymentForm';

type TAddClientPaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  companyList: TObject[];
  partnerList: TObject[];
  paymentList: any[];
  onClientPaymentRecordsSubmit: (values: any) => void;
  inProgress?: boolean;
  onQueryCompanyBookers: (id: string) => void;
  companyBookers: TCompanyMemberWithDetails[];
  queryBookersInProgress: boolean;
  hasSelectedPaymentRecords?: boolean;
};

const AddClientPaymentModal: React.FC<TAddClientPaymentModalProps> = (
  props,
) => {
  const {
    isOpen,
    onClose,
    companyList,
    partnerList,
    paymentList,
    onClientPaymentRecordsSubmit,
    inProgress,
    onQueryCompanyBookers,
    companyBookers,
    queryBookersInProgress,
    hasSelectedPaymentRecords,
  } = props;

  const selectInputRef = useRef<any>(null);

  const handleModalClose = () => {
    onClose();
    selectInputRef?.current?.clearValue();
  };

  return (
    <Modal
      id="AddClientPaymentModal.addCompanyPartner"
      isOpen={isOpen}
      title="Thêm thanh toán"
      handleClose={handleModalClose}>
      <AddClientPaymentForm
        onSubmit={onClientPaymentRecordsSubmit}
        companyList={companyList}
        partnerList={partnerList}
        unPaidPaymentList={paymentList}
        inProgress={inProgress}
        selectInputRef={selectInputRef}
        onQueryCompanyBookers={onQueryCompanyBookers}
        companyBookers={companyBookers}
        queryBookersInProgress={queryBookersInProgress}
        hasSelectedPaymentRecords={hasSelectedPaymentRecords}
      />
    </Modal>
  );
};

export default AddClientPaymentModal;
