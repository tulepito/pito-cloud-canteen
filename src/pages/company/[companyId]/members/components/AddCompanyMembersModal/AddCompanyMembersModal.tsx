import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';

import Button from '@components/Button/Button';
import Modal from '@components/Modal/Modal';
import OutsideClickHandler from '@components/OutsideClickHandler/OutsideClickHandler';
import { useAppSelector } from '@hooks/reduxHooks';
import type { TCurrentUser, TUser } from '@utils/types';

import { useAddMemberEmail } from '../../hooks/useAddMemberEmail';
import AddCompanyMembersForm from '../AddCompanyMembersForm/AddCompanyMembersForm';

import css from './AddCompanyMembersModal.module.scss';

type CreateGroupModalProps = {
  isOpen: boolean;
  onClose: () => void;
};
const AddCompanyMembersModal: React.FC<CreateGroupModalProps> = (props) => {
  const intl = useIntl();
  const { isOpen, onClose } = props;
  const {
    emailList,
    setEmailList,
    loadedResult,
    removeEmailValue,
    onAddMembersSubmit,
    checkEmailList,
  } = useAddMemberEmail();

  const checkEmailExistedInProgress = useAppSelector(
    (state) => state.companyMember.checkEmailExistedInProgress,
  );
  const { addMembersInProgress, addMembersError } = useAppSelector(
    (state) => state.companyMember,
  );
  const companyAccount = useAppSelector(
    (state) => state.company.company,
    shallowEqual,
  );

  const currentUser = useAppSelector(
    (state) => state.user.currentUser,
    shallowEqual,
  );

  const handleSubmit = async () => {
    await onAddMembersSubmit();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      handleClose={onClose}
      containerClassName={css.modalContainer}
      title={intl.formatMessage({ id: 'AddCompanyMembersModal.modalTitle' })}>
      <OutsideClickHandler onOutsideClick={onClose}>
        <div className={css.modalContainer}>
          <div className={css.modalContent}>
            <AddCompanyMembersForm
              onSubmit={handleSubmit}
              initialValues={[]}
              emailList={emailList}
              setEmailList={setEmailList}
              loadedResult={loadedResult}
              checkInputEmailValue={checkEmailList}
              emailCheckingInProgress={checkEmailExistedInProgress}
              companyAccount={companyAccount as TUser}
              removeEmailValue={removeEmailValue}
              addMembersInProgress={addMembersInProgress}
              addMembersError={addMembersError}
              currentUser={currentUser as TCurrentUser}
            />
          </div>
          <div className={css.modalFooter}>
            <Button
              variant="secondary"
              className={css.cancelBtn}
              onClick={onClose}>
              {intl.formatMessage({ id: 'AddCompanyMembersModal.cancel' })}
            </Button>
          </div>
        </div>
      </OutsideClickHandler>
    </Modal>
  );
};

export default AddCompanyMembersModal;
