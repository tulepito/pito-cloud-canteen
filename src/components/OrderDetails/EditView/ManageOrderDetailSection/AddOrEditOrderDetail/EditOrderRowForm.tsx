import { useEffect, useState } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';

import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldSelect from '@components/FormFields/FieldSelect/FieldSelect';
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
  const { handleSubmit, foodOptions, submitting, pristine } = props;
  const intl = useIntl();

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

  const selectFoodOptions = (
    <>
      <option disabled value="">
        {intl.formatMessage({
          id: 'EditOrderRowForm.foodSelectField.placeholder',
        })}
      </option>

      {foodOptions?.map(({ foodId, foodName }) => (
        <option key={foodId} value={foodId}>
          {shortenString(foodName, 16)}
        </option>
      ))}
    </>
  );

  const handleToggleShowHideRequirementField = () => {
    setIsRequirementInputShow(!isRequirementInputShow);
  };

  useEffect(() => {
    if (isRequirementInputShow) {
      setCurrentRequirementFieldActionText(hideRequirementText);
    } else {
      setCurrentRequirementFieldActionText(showRequirementText);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRequirementInputShow]);

  return (
    <Form onSubmit={handleSubmit} className={css.root}>
      <div className={css.fieldOnRow}>
        <FieldTextInput name="memberName" disabled className={css.input} />
        <FieldSelect id="foodId" name="foodId" className={css.input}>
          {selectFoodOptions}
        </FieldSelect>
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
