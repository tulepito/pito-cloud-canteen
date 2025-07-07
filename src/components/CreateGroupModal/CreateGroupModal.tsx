import { useIntl } from 'react-intl';

import Button from '@components/Button/Button';
import CreateGroupForm from '@components/CreateGroupForm/CreateGroupForm';
import Modal from '@components/Modal/Modal';
import OutsideClickHandler from '@components/OutsideClickHandler/OutsideClickHandler';
import RenderWhen from '@components/RenderWhen/RenderWhen';

import css from './CreateGroupModal.module.scss';

type CreateGroupModalProps = {
  isOpen: boolean;
  companyMembers: any[];
  originCompanyMembers: any;
  onClose: () => void;
};
const CreateGroupModal: React.FC<CreateGroupModalProps> = (props) => {
  const intl = useIntl();
  const { isOpen, onClose, companyMembers, originCompanyMembers } = props;
  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      handleClose={onClose}
      containerClassName={css.modalContainer}
      title={intl.formatMessage({ id: 'CreateGroupModal.modalTitle' })}>
      <OutsideClickHandler onOutsideClick={onClose}>
        <div className={css.modalContainer}>
          <div className={css.modalContent}>
            <CreateGroupForm
              companyMembers={companyMembers}
              originCompanyMembers={originCompanyMembers}
              onModalClose={onClose}
            />
          </div>
          <RenderWhen condition={!!companyMembers?.length}>
            <div className={css.modalFooter}>
              <Button
                variant="secondary"
                className={css.cancelBtn}
                onClick={onClose}>
                {intl.formatMessage({ id: 'CreateGroupModal.cancel' })}
              </Button>
            </div>
          </RenderWhen>
        </div>
      </OutsideClickHandler>
    </Modal>
  );
};

export default CreateGroupModal;
