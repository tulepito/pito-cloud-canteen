import CreateGroupForm from '@components/CreateGroupForm/CreateGroupForm';
import OutsideClickHandler from '@components/OutsideClickHandler/OutsideClickHandler';
import classNames from 'classnames';

import css from './CreateGroupModal.module.scss';
import IconModalClose from './IconModalClose';

type CreateGroupModalProps = {
  isOpen: boolean;
  companyMembers: any[];
  onClose: () => void;
};
const CreateGroupModal: React.FC<CreateGroupModalProps> = (props) => {
  const { isOpen, onClose, companyMembers } = props;
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
              <span className={css.modalTitle}>Tao nhom moi</span>
              <IconModalClose />
            </div>
            <div className={css.modalContent}>
              <CreateGroupForm companyMembers={companyMembers} />
            </div>
            <div className={css.modalFooter}>
              <div onClick={onClose}>Huy</div>
            </div>
          </div>
        </OutsideClickHandler>
      </div>
    </div>
  );
};

export default CreateGroupModal;
