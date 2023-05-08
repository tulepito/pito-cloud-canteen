/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo } from 'react';

import IconArrowHead from '@components/Icons/IconArrowHead/IconArrowHead';
import Modal from '@components/Modal/Modal';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { User } from '@src/utils/data';
import type { TCurrentUser, TUser } from '@src/utils/types';

import { AccountThunks } from '../../Account.slice';
import type { TSpecialDemandFormValues } from '../SpecialDemandForm/SpecialDemandForm';
import SpecialDemandForm from '../SpecialDemandForm/SpecialDemandForm';

import css from './SpecialDemandModal.module.scss';

type TSpecialDemandModalProps = {
  isOpen: boolean;
  onClose: () => void;
  nutritionOptions: { key: string; label: string }[];
  currentUser: TUser | TCurrentUser;
};
const SpecialDemandModal: React.FC<TSpecialDemandModalProps> = (props) => {
  const { isOpen, onClose, nutritionOptions, currentUser } = props;
  const dispatch = useAppDispatch();
  const currentUserGetter = User(currentUser as TUser);
  const { allergies = [], nutritions = [] } = currentUserGetter.getPublicData();
  const updateSpecialDemandInProgress = useAppSelector(
    (state) => state.ParticipantAccount.updateSpecialDemandInProgress,
  );

  const initialValues = useMemo(
    () => ({ allergies, nutritions }),
    [JSON.stringify(allergies), JSON.stringify(nutritions)],
  );
  const handleSubmit = async (values: TSpecialDemandFormValues) => {
    await dispatch(AccountThunks.updateSpecialDemand(values));
  };

  return (
    <Modal
      id="SpecialDemandModal"
      isOpen={isOpen}
      handleClose={onClose}
      className={css.modal}
      closeClassName={css.closedModal}
      containerClassName={css.modalContainer}
      shouldHideIconClose>
      <div className={css.modalHeader}>
        <div className={css.goBackContainer} onClick={onClose}>
          <IconArrowHead direction="left" />
          <span className={css.goBack}></span>
          Quay lại
        </div>
        <div className={css.modalTitle}>Tài khoản cá nhân</div>
      </div>
      <div className={css.modalContent}>
        <SpecialDemandForm
          onSubmit={handleSubmit}
          initialValues={initialValues}
          nutritionOptions={nutritionOptions}
          inProgress={updateSpecialDemandInProgress}
        />
      </div>
    </Modal>
  );
};

export default SpecialDemandModal;
