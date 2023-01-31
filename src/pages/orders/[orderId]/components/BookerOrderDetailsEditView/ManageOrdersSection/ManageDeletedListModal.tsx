import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import Modal from '@components/Modal/Modal';
import type { TObject } from '@utils/types';
import arrayMutators from 'final-form-arrays';
import { useMemo, useState } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';

import FieldMemberSelectCheckboxGroup from './FieldMemberSelectCheckboxGroup';
import css from './ManageDeletedListModal.module.scss';

enum ButtonAction {
  DELETE = 'delete',
  RESTORE = 'restore',
}

export type TManageDeletedListFormValues = {
  memberIds: string[];
};

type TExtraProps = {
  deletedTabData: TObject[];
  setAction: (actionType: ButtonAction) => () => void;
};
type TManageDeletedListFormComponentProps =
  FormRenderProps<TManageDeletedListFormValues> & Partial<TExtraProps>;
type TManageDeletedListFormProps = FormProps<TManageDeletedListFormValues> &
  TExtraProps;

const ManageDeletedListFormComponent: React.FC<
  TManageDeletedListFormComponentProps
> = (props) => {
  const {
    handleSubmit,
    deletedTabData = [],
    values: { memberIds },
    setAction,
  } = props;
  const intl = useIntl();

  const disabledButton = !memberIds || memberIds?.length === 0;

  const deletePermanentlyText = intl.formatMessage({
    id: 'ManageDeletedListForm.deletePermanently',
  });
  const restoreText = intl.formatMessage({
    id: 'ManageDeletedListForm.restore',
  });

  const memberOptions = useMemo(
    () =>
      deletedTabData?.map((item) => {
        const {
          memberData: { id: memberId },
        } = item;
        return { key: memberId, value: memberId, data: item };
      }),
    [deletedTabData],
  );

  return (
    <Form onSubmit={handleSubmit}>
      <FieldMemberSelectCheckboxGroup
        name="memberIds"
        options={memberOptions}
      />
      {deletedTabData.length > 0 && (
        <div className={css.actions}>
          <Button
            variant="secondary"
            size="medium"
            onClick={setAction && setAction(ButtonAction.DELETE)}
            disabled={disabledButton}
            type="submit">
            {deletePermanentlyText}
          </Button>
          <Button
            size="medium"
            onClick={setAction && setAction(ButtonAction.RESTORE)}
            disabled={disabledButton}
            type="submit">
            {restoreText}
          </Button>
        </div>
      )}
    </Form>
  );
};

const ManageDeletedListForm: React.FC<TManageDeletedListFormProps> = (
  props,
) => {
  return (
    <FinalForm
      {...props}
      mutators={{ ...arrayMutators }}
      component={ManageDeletedListFormComponent}
    />
  );
};

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
  const [action, setAction] = useState<ButtonAction>(ButtonAction.RESTORE);

  const title = intl.formatMessage(
    { id: 'ManageDeletedListModal.title' },
    { count: deletedTabData.length },
  );

  const handleChangeAction = (actionType: ButtonAction) => () => {
    setAction(actionType);
  };
  const handleSubmit = ({ memberIds }: TManageDeletedListFormValues) => {
    if (action === ButtonAction.RESTORE) {
      onRestoreMembers(memberIds);
    } else if (action === ButtonAction.DELETE) {
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
          containerClassName={css.modalContainer}>
          <ManageDeletedListForm
            setAction={handleChangeAction}
            deletedTabData={deletedTabData}
            className={css.contentContainer}
            onSubmit={handleSubmit}
          />
        </Modal>
      )}
    </>
  );
};

export default ManageDeletedListModal;
