import { useState } from 'react';
import { useIntl } from 'react-intl';

import Modal from '@components/Modal/Modal';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import SlideModal from '@components/SlideModal/SlideModal';
import { useViewport } from '@hooks/useViewport';
import type { RestoreDraftDisAllowedMemberPayload } from '@redux/slices/OrderManagement.slice';
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
  onRestoreMembers: (
    members: RestoreDraftDisAllowedMemberPayload['members'],
  ) => void;
  onDeletePermanentlyMembers: (memberIds: string[]) => void;
  deletedTabData: TObject[];
  disabled: boolean;
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
    disabled,
  } = props;
  const intl = useIntl();
  const { isMobileLayout } = useViewport();
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
      const members = memberIds.reduce((acc, memberId) => {
        const member = deletedTabData.find(
          (item) => item.memberData.id === memberId,
        );

        if (member) {
          acc.push(member);
        }

        return acc;
      }, [] as RestoreDraftDisAllowedMemberPayload['members']);
      onRestoreMembers(members);
    } else if (action === ManageDeletedListFormAction.DELETE) {
      onDeletePermanentlyMembers(memberIds);
    }

    onClose();
  };

  const content = (
    <ManageDeletedListForm
      setAction={handleChangeAction}
      deletedTabData={deletedTabData}
      onSubmit={handleSubmit}
      disabled={disabled}
    />
  );

  return (
    <RenderWhen condition={isMobileLayout}>
      <SlideModal
        id="ManageDeletedMobileModal"
        modalTitle={title}
        onClose={onClose}
        isOpen={isOpen}>
        {content}
      </SlideModal>

      <RenderWhen.False>
        {isOpen && (
          <Modal
            title={title}
            className={css.root}
            isOpen={isOpen}
            handleClose={onClose}
            containerClassName={css.modalContainer}
            contentClassName={css.modalContentContainer}>
            {content}
          </Modal>
        )}
      </RenderWhen.False>
    </RenderWhen>
  );
};

export default ManageDeletedListModal;
