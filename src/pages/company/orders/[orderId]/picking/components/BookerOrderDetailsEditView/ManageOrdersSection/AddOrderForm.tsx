import { useEffect, useState } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';

import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldSelect from '@components/FormFields/FieldSelect/FieldSelect';
import FieldTextArea from '@components/FormFields/FieldTextArea/FieldTextArea';
import IconMinus from '@components/Icons/IconMinus/IconMinus';
import IconPlusWithoutBorder from '@components/Icons/IconPlusWithoutBorder/IconPlusWithoutBorder';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { shortenString } from '@src/utils/string';

import css from './AddOrderForm.module.scss';

export type TAddOrderFormValues = {
  participantId: string;
  foodId: string;
  requirement: string;
};

type TExtraProps = {
  foodOptions: {
    foodId: string;
    foodName: string;
  }[];
  memberOptions: {
    memberId: string;
    memberName: string;
  }[];
};
type TAddOrderFormComponentProps = FormRenderProps<TAddOrderFormValues> &
  Partial<TExtraProps>;
type TAddOrderFormProps = FormProps<TAddOrderFormValues> & TExtraProps;

const AddOrderFormComponent: React.FC<TAddOrderFormComponentProps> = (
  props,
) => {
  const intl = useIntl();

  const { foodOptions, memberOptions, handleSubmit, values } = props;
  const fieldSelectMemberDisable = memberOptions?.length === 0;
  const fieldSelectFoodDisable =
    fieldSelectMemberDisable || foodOptions?.length === 0;
  const submitDisabled =
    fieldSelectFoodDisable || !values?.participantId || !values?.foodId;

  const showRequirementText = intl.formatMessage({
    id: 'AddOrderForm.addRequirement.show',
  });

  const hideRequirementText = intl.formatMessage({
    id: 'AddOrderForm.addRequirement.hide',
  });
  const [isRequirementInputShow, setIsRequirementInputShow] = useState(false);
  const [
    currentRequirementFieldActionText,
    setCurrentRequirementFieldActionText,
  ] = useState(showRequirementText);

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

  const selectMemberOptions = (
    <>
      <option disabled value="">
        {intl.formatMessage({
          id: 'AddOrderForm.participantIdField.placeholder',
        })}
      </option>

      {memberOptions?.map(({ memberId, memberName }) => (
        <option key={memberId} value={memberId}>
          {shortenString(memberName, 18)}
        </option>
      ))}
    </>
  );
  const selectFoodOptions = (
    <>
      <option disabled value="">
        {intl.formatMessage({
          id: 'AddOrderForm.foodIdField.placeholder',
        })}
      </option>

      {foodOptions?.map(({ foodId, foodName }) => (
        <option key={foodId} value={foodId}>
          {shortenString(foodName, 18)}
        </option>
      ))}
    </>
  );

  return (
    <Form onSubmit={handleSubmit} className={css.root}>
      <div className={css.fieldsContainer}>
        <div className={css.fieldContainer}>
          <FieldSelect
            disabled={fieldSelectMemberDisable}
            id={'addOrder.participantName'}
            name="participantId"
            selectClassName={css.fieldSelect}>
            {selectMemberOptions}
          </FieldSelect>
        </div>
        <div className={css.fieldContainer}>
          <FieldSelect
            disabled={fieldSelectFoodDisable}
            id={'addOrder.foodId'}
            name="foodId"
            selectClassName={css.fieldSelect}>
            {selectFoodOptions}
          </FieldSelect>
        </div>
        <Button disabled={submitDisabled} className={css.submitButton}>
          {intl.formatMessage({
            id: 'AddOrderForm.submitButtonText',
          })}
        </Button>
      </div>

      <div className={css.addRequirementContainer}>
        <Button
          type="button"
          variant="inline"
          disabled={fieldSelectFoodDisable}
          onClick={handleToggleShowHideRequirementField}>
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
              id="AddOrderForm.requirement"
              name="requirement"
              label={intl.formatMessage({
                id: 'AddOrderForm.requirementField.label',
              })}
              placeholder={intl.formatMessage({
                id: 'AddOrderForm.requirementField.placeholder',
              })}
            />
          </div>
        )}
      </div>
    </Form>
  );
};

const AddOrderForm: React.FC<TAddOrderFormProps> = (props) => {
  return <FinalForm {...props} component={AddOrderFormComponent} />;
};

export default AddOrderForm;
