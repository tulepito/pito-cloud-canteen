import { useState } from 'react';
import { useIntl } from 'react-intl';

import Modal from '@components/Modal/Modal';
import type { TObject } from '@utils/types';

import type { TManageDeletedListFormValues } from './ManageDeletedListForm';
import {
  ManageDeletedListForm,
  ManageDeletedListFormAction,
} from './ManageDeletedListForm';

import css from './ManageDeletedListModal.module.scss';

type TManageDeletedListModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onRestoreMembers: (memberIds: string[]) => void;
  onDeletePermanentlyMembers: (memberIds: string[]) => void;
  deletedTabData: TObject[];
};

const ManageDeletedListModal: React.FC<TManageDeletedListModalProps> = (
  props,
) => {
  const {
    isOpen,
    onClose,
    deletedTabData,
    onRestoreMembers,
    onDeletePermanentlyMembers,
  } = props;
  const intl = useIntl();
  const [action, setAction] = useState<ManageDeletedListFormAction>(
    ManageDeletedListFormAction.RESTORE,
  );

  const title = intl.formatMessage(
    { id: 'ManageDeletedListModal.title' },
    { count: deletedTabData.length },
  );

  const handleChangeAction =
    (actionType: ManageDeletedListFormAction) => () => {
      setAction(actionType);
    };

  const handleSubmit = ({ memberIds }: TManageDeletedListFormValues) => {
    if (action === ManageDeletedListFormAction.RESTORE) {
      onRestoreMembers(memberIds);
    } else if (action === ManageDeletedListFormAction.DELETE) {
      onDeletePermanentlyMembers(memberIds);
    }

    onClose();
  };

  return (
    <>
      {isOpen && (
        <Modal
          title={title}
          className={css.root}
          isOpen={isOpen}
          handleClose={onClose}
          containerClassName={css.modalContainer}
          contentClassName={css.modalContentContainer}>
          <ManageDeletedListForm
            setAction={handleChangeAction}
            deletedTabData={deletedTabData}
            onSubmit={handleSubmit}
          />
        </Modal>
      )}
    </>
  );
};

export default ManageDeletedListModal;
