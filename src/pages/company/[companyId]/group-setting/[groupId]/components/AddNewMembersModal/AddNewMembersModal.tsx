import Button from '@components/Button/Button';
import Modal from '@components/Modal/Modal';
import OutsideClickHandler from '@components/OutsideClickHandler/OutsideClickHandler';
import { useIntl } from 'react-intl';

import AddNewMembersForm from '../AddNewMembersForm/AddNewMembersForm';
import css from './AddNewMembersModal.module.scss';

type AddNewMembersModalProps = {
  isOpen: boolean;
  companyMembers: any[];
  groupMembers: any[];
  groupId: string;
  onClose: () => void;
};
const AddNewMembersModal: React.FC<AddNewMembersModalProps> = (props) => {
  const intl = useIntl();
  const { isOpen, onClose, companyMembers, groupMembers, groupId } = props;

  return (
    <Modal
      isOpen={isOpen}
      handleClose={onClose}
      containerClassName={css.modalContainer}
      title={intl.formatMessage({ id: 'AddNewMembersModal.modalTitle' })}>
      <OutsideClickHandler onOutsideClick={onClose}>
        <div className={css.modalContainer}>
          <div className={css.modalContent}>
            <AddNewMembersForm
              companyMembers={companyMembers}
              groupMembers={groupMembers}
              groupId={groupId}
              onModalClose={onClose}
            />
          </div>
          <div className={css.modalFooter}>
            <Button className={css.cancelBtn} onClick={onClose}>
              {intl.formatMessage({ id: 'AddNewMembersModal.cancel' })}
            </Button>
          </div>
        </div>
      </OutsideClickHandler>
    </Modal>
  );
};

export default AddNewMembersModal;
