import Modal from '@components/Modal/Modal';
import { useIntl } from 'react-intl';

import type { TEditOrderRowFormValues } from './EditOrderRowForm';
import EditOrderRowForm from './EditOrderRowForm';
import css from './EditOrderRowModal.module.scss';

type TEditOrderRowModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: TEditOrderRowFormValues) => void;
};

const EditOrderRowModal: React.FC<TEditOrderRowModalProps> = (props) => {
  const { onClose, isOpen, onSubmit } = props;
  const intl = useIntl();

  return (
    <Modal
      className={css.root}
      containerClassName={css.modalContainer}
      handleClose={onClose}
      isOpen={isOpen}
      title={intl.formatMessage({
        id: 'EditOrderRowModal.title',
      })}>
      <div>{intl.formatMessage({ id: 'EditOrderRowModal.subtitle' })}</div>

      <EditOrderRowForm onSubmit={onSubmit} />
    </Modal>
  );
};

export default EditOrderRowModal;
