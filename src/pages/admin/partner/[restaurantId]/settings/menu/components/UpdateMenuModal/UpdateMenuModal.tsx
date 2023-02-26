import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import AlertModal from '@components/Modal/AlertModal';
import type { FormApi } from 'final-form';
import React, { useMemo, useRef } from 'react';
import { FormattedMessage } from 'react-intl';

import css from './UpdateMenuModal.module.scss';
import type { TUpdateMenuModalFormValues } from './UpdateMenuModalForm';
import UpdateMenuModalForm from './UpdateMenuModalForm';

type TUpdateMenuModalProps = {
  menuToUpdate: any;
  onClearMenuToUpdate: () => void;
  onUpdateMenuApplyTime: (values: TUpdateMenuModalFormValues) => void;
  updateInProgress: boolean;
  createOrUpdateMenuError: any;
};

const UpdateMenuModal: React.FC<TUpdateMenuModalProps> = (props) => {
  const {
    menuToUpdate,
    onClearMenuToUpdate,
    updateInProgress,
    onUpdateMenuApplyTime,
    createOrUpdateMenuError,
  } = props;
  const initialValues = useMemo(() => {
    return {
      ...(menuToUpdate || {}),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(menuToUpdate)]);

  const formRef = useRef<FormApi>();

  const handleSubmitUpdaetMenuModalForm = () => {
    if (formRef.current) {
      formRef.current?.submit();
    }
  };

  return (
    <AlertModal
      isOpen={menuToUpdate}
      containerClassName={css.modalContainer}
      handleClose={onClearMenuToUpdate}
      onCancel={onClearMenuToUpdate}
      onConfirm={handleSubmitUpdaetMenuModalForm}
      title={
        <h3 className={css.title}>
          <FormattedMessage id="UpdateMenuModal.title" />
        </h3>
      }
      confirmLabel="Áp dụng"
      cancelLabel="Hủy"
      actionsClassName={css.modalActions}
      confirmClassName={css.modalButton}
      confirmInProgress={updateInProgress}
      confirmDisabled={updateInProgress}
      cancelClassName={css.modalButton}>
      <UpdateMenuModalForm
        formRef={formRef}
        onSubmit={onUpdateMenuApplyTime}
        initialValues={initialValues}
      />
      {createOrUpdateMenuError && (
        <ErrorMessage message={createOrUpdateMenuError.message} />
      )}
    </AlertModal>
  );
};

export default UpdateMenuModal;
