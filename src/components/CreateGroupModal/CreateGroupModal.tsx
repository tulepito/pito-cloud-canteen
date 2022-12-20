import Button from '@components/Button/Button';
import CreateGroupForm from '@components/CreateGroupForm/CreateGroupForm';
import IconModalClose from '@components/IconModalClose/IconModalClose';
import OutsideClickHandler from '@components/OutsideClickHandler/OutsideClickHandler';
import classNames from 'classnames';

import css from './CreateGroupModal.module.scss';

type CreateGroupModalProps = {
  isOpen: boolean;
  companyMembers: any[];
  originCompanyMembers: any;
  onClose: () => void;
};
const CreateGroupModal: React.FC<CreateGroupModalProps> = (props) => {
  const { isOpen, onClose, companyMembers, originCompanyMembers } = props;
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
              <IconModalClose onClick={onClose} />
            </div>
            <div className={css.modalContent}>
              <CreateGroupForm
                companyMembers={companyMembers}
                originCompanyMembers={originCompanyMembers}
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

export default CreateGroupModal;
