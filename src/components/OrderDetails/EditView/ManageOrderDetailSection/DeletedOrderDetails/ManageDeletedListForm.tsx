import { useMemo } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';
import arrayMutators from 'final-form-arrays';
import isEmpty from 'lodash/isEmpty';

import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import type { TObject } from '@utils/types';

import FieldMemberSelectCheckboxGroup from './FieldMemberSelectCheckboxGroup';

import css from './ManageDeletedListForm.module.scss';

export enum ManageDeletedListFormAction {
  DELETE = 'delete',
  RESTORE = 'restore',
}

export type TManageDeletedListFormValues = {
  memberIds: string[];
};

type TExtraProps = {
  deletedTabData: TObject[];
  setAction: (actionType: ManageDeletedListFormAction) => () => void;
  disabled: boolean;
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
    disabled,
  } = props;
  const intl = useIntl();

  const disabledButton = isEmpty(memberIds) || disabled;

  const deletePermanentlyText = intl.formatMessage({
    id: 'ManageDeletedListForm.deletePermanently',
  });
  const restoreText = intl.formatMessage({
    id: 'ManageDeletedListForm.restore',
  });

  const memberOptions = useMemo(
    () =>
      deletedTabData?.map((item) => {
        const { memberData } = item;
        const { id: memberId } = memberData || {};

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

      <div className={css.actions}>
        <Button
          variant="secondary"
          size="medium"
          onClick={setAction && setAction(ManageDeletedListFormAction.DELETE)}
          disabled={disabledButton}
          type="submit">
          {deletePermanentlyText}
        </Button>
        <Button
          size="medium"
          onClick={setAction && setAction(ManageDeletedListFormAction.RESTORE)}
          disabled={disabledButton}
          type="submit">
          {restoreText}
        </Button>
      </div>
    </Form>
  );
};

export const ManageDeletedListForm: React.FC<TManageDeletedListFormProps> = (
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
