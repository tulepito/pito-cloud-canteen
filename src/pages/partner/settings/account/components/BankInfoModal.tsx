import { useMemo } from 'react';

import IconArrow from '@components/Icons/IconArrow/IconArrow';
import Modal from '@components/Modal/Modal';
import { useAppSelector } from '@hooks/reduxHooks';
import { OwnListing } from '@src/utils/data';

import BankInfoForm from './BankInfoForm';

import css from './BankInfoModal.module.scss';

type TNavigationModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const BankInfoModal: React.FC<TNavigationModalProps> = (props) => {
  const { isOpen, onClose } = props;

  const restaurantListing = useAppSelector(
    (state) => state.PartnerSettingsPage.restaurantListing,
  );

  const restaurantGetter = OwnListing(restaurantListing);
  const { bankAccounts = [] } = restaurantGetter.getPrivateData();
  const { bankId, bankAgency, bankAccountNumber, bankOwnerName } =
    bankAccounts[0] || {
      bankId: '',
      bankAgency: '',
      bankAccountNumber: '',
      bankOwnerName: '',
    };

  const initialValues = useMemo(() => {
    return {
      bankId,
      bankAgency,
      bankAccountNumber,
      bankOwnerName,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(restaurantListing)]);

  return (
    <Modal
      isOpen={isOpen}
      className={css.root}
      handleClose={() => {}}
      containerClassName={css.modalContainer}
      headerClassName={css.modalHeader}
      shouldHideIconClose>
      <div>
        <div className={css.heading}>
          <IconArrow direction="left" onClick={onClose} />
          <div>Thông tin ngân hàng</div>
        </div>

        <BankInfoForm initialValues={initialValues} onSubmit={() => {}} />
      </div>
    </Modal>
  );
};

export default BankInfoModal;
