import Button from '@components/Button/Button';
import IconModalClose from '@components/Icons/IconModalClose/IconModalClose';
import OutsideClickHandler from '@components/OutsideClickHandler/OutsideClickHandler';
import classNames from 'classnames';

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
  const { isOpen, onClose, companyMembers, groupMembers, groupId } = props;
  const modalClasses = classNames(css.modal, {
    [css.open]: isOpen,
  });
  if (!isOpen) {
    return null;
  }
  return (
    <div className={modalClasses}>
      <div className={css.overlay}>
        <OutsideClickHandler onOutsideClick={onClose}>
          <div className={css.modalContainer}>
            <div className={css.modalHeader}>
              <span className={css.modalTitle}>Them thanh vien</span>
              <IconModalClose onClick={onClose} />
            </div>
            <div className={css.modalContent}>
              <AddNewMembersForm
                companyMembers={companyMembers}
                groupMembers={groupMembers}
                groupId={groupId}
              />
            </div>
            <div className={css.modalFooter}>
              <Button className={css.cancelBtn} onClick={onClose}>
                Huy
              </Button>
            </div>
          </div>
        </OutsideClickHandler>
      </div>
    </div>
  );
};

export default AddNewMembersModal;
