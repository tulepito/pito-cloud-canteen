import { useIntl } from 'react-intl';

import Button from '@components/Button/Button';
import OutsideClickHandler from '@components/OutsideClickHandler/OutsideClickHandler';
import SlideModal from '@components/SlideModal/SlideModal';

import AddNewMembersForm from '../AddNewMembersForm/AddNewMembersForm';

import css from './AddNewMembersSlideModal.module.scss';

type TAddNewMembersSlideModalProps = {
  isOpen: boolean;
  companyMembers: any[];
  groupMembers: any[];
  groupId: string;
  onClose: () => void;
};
const AddNewMembersSlideModal: React.FC<TAddNewMembersSlideModalProps> = (
  props,
) => {
  const intl = useIntl();
  const { isOpen, onClose, companyMembers, groupMembers, groupId } = props;

  return (
    <SlideModal
      id="AddNewMembersSlideModal"
      isOpen={isOpen}
      onClose={onClose}
      containerClassName={css.modalContainer}
      modalTitle={intl.formatMessage({ id: 'AddNewMembersModal.modalTitle' })}>
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
            <Button
              variant="secondary"
              className={css.cancelBtn}
              onClick={onClose}>
              {intl.formatMessage({ id: 'AddNewMembersModal.cancel' })}
            </Button>
          </div>
        </div>
      </OutsideClickHandler>
    </SlideModal>
  );
};

export default AddNewMembersSlideModal;
