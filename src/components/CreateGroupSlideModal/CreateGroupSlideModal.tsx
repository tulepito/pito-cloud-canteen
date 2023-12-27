import { useIntl } from 'react-intl';

import Button from '@components/Button/Button';
import CreateGroupForm from '@components/CreateGroupForm/CreateGroupForm';
import OutsideClickHandler from '@components/OutsideClickHandler/OutsideClickHandler';
import SlideModal from '@components/SlideModal/SlideModal';

import css from './CreateGroupSlideModal.module.scss';

type TCreateGroupSlideModalProps = {
  isOpen: boolean;
  companyMembers: any[];
  originCompanyMembers: any;
  onClose: () => void;
};
const CreateGroupSlideModal: React.FC<TCreateGroupSlideModalProps> = (
  props,
) => {
  const intl = useIntl();
  const { isOpen, onClose, companyMembers, originCompanyMembers } = props;
  if (!isOpen) {
    return null;
  }

  return (
    <SlideModal
      id="CreateNewGroupSlideModal"
      isOpen={isOpen}
      onClose={onClose}
      containerClassName={css.slideModalContainer}
      modalTitle={intl.formatMessage({ id: 'CreateGroupModal.modalTitle' })}>
      <OutsideClickHandler onOutsideClick={onClose}>
        <div className={css.modalContainer}>
          <div className={css.modalContent}>
            <CreateGroupForm
              companyMembers={companyMembers}
              originCompanyMembers={originCompanyMembers}
              onModalClose={onClose}
            />
          </div>
          <div className={css.modalFooter}>
            <Button
              variant="inline"
              className={css.cancelBtn}
              onClick={onClose}>
              {intl.formatMessage({ id: 'CreateGroupModal.cancel' })}
            </Button>
          </div>
        </div>
      </OutsideClickHandler>
    </SlideModal>
  );
};

export default CreateGroupSlideModal;
