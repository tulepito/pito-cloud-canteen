import { useEffect } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';
import { useRouter } from 'next/router';

import Form from '@components/Form/Form';
import FieldDropdownSelect from '@components/FormFields/FieldDropdownSelect/FieldDropdownSelect';
import FieldRadioButton from '@components/FormFields/FieldRadioButton/FieldRadioButton';
import IconSpinner from '@components/Icons/IconSpinner/IconSpinner';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { menusSliceThunks } from '@redux/slices/menus.slice';
import type { TIntegrationListing } from '@utils/types';

import css from './CreateMenuOptionForm.module.scss';

export type TCreateMenuOptionFormValues = {
  createOption: string;
  duplicateId?: string;
};

type TExtraProps = {
  formRef: any;
};
type TCreateMenuOptionFormComponentProps =
  FormRenderProps<TCreateMenuOptionFormValues> & Partial<TExtraProps>;
type TCreateMenuOptionFormProps = FormProps<TCreateMenuOptionFormValues> &
  TExtraProps;

const parseMenuToOptions = (menues: TIntegrationListing[]) => {
  return menues.map((m) => ({
    key: m.id.uuid,
    label: m.attributes.title,
  }));
};

const CreateMenuOptionFormComponent: React.FC<
  TCreateMenuOptionFormComponentProps
> = (props) => {
  const { handleSubmit, values, formRef, form } = props;
  formRef.current = form;
  const { restaurantId } = useRouter().query;
  const intl = useIntl();
  const { createOption } = values;

  const isDuplicateOptionChoosen = createOption === 'duplicate';
  const dispatch = useAppDispatch();
  const menuOptionsToDuplicate = useAppSelector(
    (state) => state.menus.menuOptionsToDuplicate,
    shallowEqual,
  );

  const queryMenuOptionsInProgress = useAppSelector(
    (state) => state.menus.queryMenuOptionsInProgress,
    shallowEqual,
  );
  useEffect(() => {
    if (!isDuplicateOptionChoosen || !restaurantId) return;
    dispatch(
      menusSliceThunks.queryMenuOptionsToDuplicate({
        restaurantId: restaurantId as string,
      }),
    );
  }, [isDuplicateOptionChoosen, dispatch, restaurantId]);

  const options = parseMenuToOptions(menuOptionsToDuplicate);

  return (
    <Form onSubmit={handleSubmit}>
      <>
        <FieldRadioButton
          name="createOption"
          id="create"
          value="create"
          label={intl.formatMessage({
            id: 'CreateMenuOptionForm.createOptionLabel',
          })}
        />
        <FieldRadioButton
          name="createOption"
          id="duplicate"
          value="duplicate"
          label={intl.formatMessage({
            id: 'CreateMenuOptionForm.duplicateOptionLabel',
          })}
        />
        {isDuplicateOptionChoosen &&
          (queryMenuOptionsInProgress ? (
            <IconSpinner className={css.iconSpinner} />
          ) : (
            <FieldDropdownSelect
              label={intl.formatMessage({
                id: 'CreateMenuOptionForm.duplicateIdLabel',
              })}
              className={css.fieldSelect}
              name="duplicateId"
              id="duplicateId"
              options={options}
              placeholder="Chọn Menu"
            />
          ))}
      </>
    </Form>
  );
};

const CreateMenuOptionForm: React.FC<TCreateMenuOptionFormProps> = (props) => {
  return <FinalForm {...props} component={CreateMenuOptionFormComponent} />;
};

export default CreateMenuOptionForm;
