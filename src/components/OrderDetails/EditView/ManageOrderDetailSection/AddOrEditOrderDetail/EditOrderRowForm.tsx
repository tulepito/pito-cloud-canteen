/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';

import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldDropdownSelect from '@components/FormFields/FieldDropdownSelect/FieldDropdownSelect';
import FieldTextArea from '@components/FormFields/FieldTextArea/FieldTextArea';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import IconMinus from '@components/Icons/IconMinus/IconMinus';
import IconPlusWithoutBorder from '@components/Icons/IconPlusWithoutBorder/IconPlusWithoutBorder';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { shortenString } from '@utils/string';

import css from './EditOrderRowForm.module.scss';

export type TEditOrderRowFormValues = {
  memberName: string;
  foodId: string;
  requirement: string;
};

type TExtraProps = {
  foodOptions: any[];
};
type TEditOrderRowFormComponentProps =
  FormRenderProps<TEditOrderRowFormValues> & Partial<TExtraProps>;
type TEditOrderRowFormProps = FormProps<TEditOrderRowFormValues> & TExtraProps;

const EditOrderRowFormComponent: React.FC<TEditOrderRowFormComponentProps> = (
  props,
) => {
  const {
    handleSubmit,
    foodOptions,
    submitting,
    pristine,
    initialValues = {},
  } = props;
  const intl = useIntl();
  const { requirement } = initialValues;

  const submitDisabled = pristine || submitting;
  const submitInprogress = submitting;
  const showRequirementText = intl.formatMessage({
    id: 'EditOrderRowForm.addRequirement.show',
  });

  const hideRequirementText = intl.formatMessage({
    id: 'EditOrderRowForm.addRequirement.hide',
  });

  const [isRequirementInputShow, setIsRequirementInputShow] = useState(false);
  const [
    currentRequirementFieldActionText,
    setCurrentRequirementFieldActionText,
  ] = useState(showRequirementText);

  const parsedFoodOptions = useMemo(
    () =>
      foodOptions?.map((f) => ({
        key: f.foodId,
        label: shortenString(f.foodName, 16),
      })),

    [JSON.stringify(foodOptions)],
  );

  const handleToggleShowHideRequirementField = () => {
    setIsRequirementInputShow(!isRequirementInputShow);
  };

  useEffect(() => {
    if (requirement) {
      setIsRequirementInputShow(true);
    }
  }, [requirement]);

  useEffect(() => {
    setCurrentRequirementFieldActionText(
      isRequirementInputShow ? hideRequirementText : showRequirementText,
    );
  }, [isRequirementInputShow]);

  return (
    <Form onSubmit={handleSubmit} className={css.root}>
      <div className={css.fieldOnRow}>
        <FieldTextInput name="memberName" disabled className={css.input} />
        <FieldDropdownSelect
          id="foodId"
          name="foodId"
          className={css.input}
          placeholder={intl.formatMessage({
            id: 'EditOrderRowForm.foodSelectField.placeholder',
          })}
          options={parsedFoodOptions}
        />
      </div>

      <Button
        type="button"
        variant="inline"
        onClick={handleToggleShowHideRequirementField}
        className={css.buttonContainer}>
        <div className={css.buttonContent}>
          <RenderWhen condition={isRequirementInputShow}>
            <IconMinus />
            <RenderWhen.False>
              <IconPlusWithoutBorder />
            </RenderWhen.False>
          </RenderWhen>
          <div>{currentRequirementFieldActionText}</div>
        </div>
      </Button>

      {isRequirementInputShow && (
        <div className={css.fieldRequirementContainer}>
          <FieldTextArea
            id="EditOrderRowForm.requirement"
            name="requirement"
            label={intl.formatMessage({
              id: 'EditOrderRowForm.requirementField.label',
            })}
            placeholder={intl.formatMessage({
              id: 'EditOrderRowForm.requirementField.placeholder',
            })}
          />
        </div>
      )}

      <div className={css.submitButtonContainer}>
        <Button
          className={css.submitButton}
          type="submit"
          disabled={submitDisabled}
          inProgress={submitInprogress}>
          {intl.formatMessage({ id: 'EditOrderRowModal.submitButtonText' })}
        </Button>
      </div>
    </Form>
  );
};

const EditOrderRowForm: React.FC<TEditOrderRowFormProps> = (props) => {
  return <FinalForm {...props} component={EditOrderRowFormComponent} />;
};

export default EditOrderRowForm;
