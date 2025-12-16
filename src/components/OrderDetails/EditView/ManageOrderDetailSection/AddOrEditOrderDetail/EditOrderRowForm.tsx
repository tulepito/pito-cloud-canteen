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
import { useAppSelector } from '@hooks/reduxHooks';

import css from './EditOrderRowForm.module.scss';

export type TEditOrderRowFormValues = {
  memberName: string;
  foodId: string;
  requirement: string;
  secondaryFoodId?: string;
  secondaryRequirement?: string;
};

type TFoodOption = {
  foodId: string;
  foodName: string;
  numberOfMainDishes: number | string;
};

type TExtraProps = {
  foodOptions: TFoodOption[];
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
    values,
    form,
  } = props;
  const intl = useIntl();
  const { requirement, secondaryRequirement } = initialValues;

  // Flag to check if the user is allowed to add a second food
  const isAllowAddSecondaryFood = useAppSelector(
    (state) => state.OrderManagement.isAllowAddSecondaryFood,
  );

  const selectedFood = useMemo(() => {
    if (!values?.foodId) return null;

    return foodOptions?.find((food) => food.foodId === values.foodId) || null;
  }, [values?.foodId, JSON.stringify(foodOptions)]);

  const isSingleSelectionFood = useMemo(() => {
    if (!selectedFood) return false;

    return Number(selectedFood.numberOfMainDishes) === 1;
  }, [selectedFood]);

  const isRequireSecondFood =
    Boolean(isAllowAddSecondaryFood) &&
    Boolean(values?.foodId) &&
    values?.foodId !== 'notJoined' &&
    !values?.secondaryFoodId &&
    !isSingleSelectionFood;

  const submitDisabled = pristine || isRequireSecondFood || submitting;
  const submitInprogress = submitting;

  // Get food names for requirement text
  const primaryFoodName = useMemo(() => {
    if (!values?.foodId || values?.foodId === 'notJoined') {
      return '';
    }

    return (
      foodOptions?.find((f) => f.foodId === values?.foodId)?.foodName || ''
    );
  }, [values?.foodId, foodOptions]);

  const secondaryFoodName = useMemo(() => {
    if (!values?.secondaryFoodId) {
      return '';
    }

    return (
      foodOptions?.find((f) => f.foodId === values?.secondaryFoodId)
        ?.foodName || ''
    );
  }, [values?.secondaryFoodId, foodOptions]);

  const showRequirementText = primaryFoodName
    ? intl.formatMessage(
        {
          id: 'EditOrderRowForm.addRequirement.showWithFood',
        },
        { foodName: primaryFoodName },
      )
    : intl.formatMessage({
        id: 'EditOrderRowForm.addRequirement.show',
      });

  const hideRequirementText = primaryFoodName
    ? intl.formatMessage(
        {
          id: 'EditOrderRowForm.addRequirement.hideWithFood',
        },
        { foodName: primaryFoodName },
      )
    : intl.formatMessage({
        id: 'EditOrderRowForm.addRequirement.hide',
      });

  const showSecondaryRequirementText = secondaryFoodName
    ? intl.formatMessage(
        {
          id: 'EditOrderRowForm.addRequirement.showWithFood',
        },
        { foodName: secondaryFoodName },
      )
    : intl.formatMessage({
        id: 'EditOrderRowForm.addRequirement.show',
      });

  const hideSecondaryRequirementText = secondaryFoodName
    ? intl.formatMessage(
        {
          id: 'EditOrderRowForm.addRequirement.hideWithFood',
        },
        { foodName: secondaryFoodName },
      )
    : intl.formatMessage({
        id: 'EditOrderRowForm.addRequirement.hide',
      });

  const [isRequirementInputShow, setIsRequirementInputShow] = useState(false);
  const [isSecondaryRequirementInputShow, setIsSecondaryRequirementInputShow] =
    useState(false);
  const [
    currentRequirementFieldActionText,
    setCurrentRequirementFieldActionText,
  ] = useState(showRequirementText);
  const [
    currentSecondaryRequirementFieldActionText,
    setCurrentSecondaryRequirementFieldActionText,
  ] = useState(showRequirementText);

  const parsedFoodOptions = useMemo(
    () =>
      foodOptions?.map((f) => ({
        key: f.foodId,
        label: (
          <p
            style={{
              lineHeight: 1.4,
              margin: 0,
            }}
            title={f.foodName}>
            {f.foodName}
          </p>
        ),
      })),
    [JSON.stringify(foodOptions)],
  );

  const parsedFoodOptionsForSecondaryFood = useMemo(
    () =>
      foodOptions?.map((f) => {
        const isSingleSelectOnlyOneFood = Number(f.numberOfMainDishes) === 1;
        const disabled = isSingleSelectOnlyOneFood && values?.foodId !== '';

        return {
          key: f.foodId,
          label: (
            <p
              style={{
                lineHeight: 1.4,
                margin: 0,
              }}
              title={f.foodName}>
              {f.foodName}
            </p>
          ),
          disabled,
        };
      }),

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
    if (secondaryRequirement) {
      setIsSecondaryRequirementInputShow(true);
    }
  }, [secondaryRequirement]);

  useEffect(() => {
    if (!values?.secondaryFoodId) {
      setIsSecondaryRequirementInputShow(false);
      if (values?.secondaryRequirement && form) {
        form.change('secondaryRequirement', undefined);
      }
    }
  }, [values?.secondaryFoodId, values?.secondaryRequirement, form]);

  useEffect(() => {
    const text = isRequirementInputShow
      ? hideRequirementText
      : showRequirementText;
    setCurrentRequirementFieldActionText(text);
  }, [isRequirementInputShow, hideRequirementText, showRequirementText]);

  useEffect(() => {
    const text = isSecondaryRequirementInputShow
      ? hideSecondaryRequirementText
      : showSecondaryRequirementText;
    setCurrentSecondaryRequirementFieldActionText(text);
  }, [
    isSecondaryRequirementInputShow,
    hideSecondaryRequirementText,
    showSecondaryRequirementText,
  ]);

  const shouldShowSecondaryRequirement =
    isAllowAddSecondaryFood === true && Boolean(values?.secondaryFoodId);

  // Clear secondaryFoodId and secondaryRequirement when primary food is single selection
  useEffect(() => {
    if (isSingleSelectionFood && values?.secondaryFoodId && form) {
      form.change('secondaryFoodId', undefined);
      form.change('secondaryRequirement', undefined);
    }
  }, [isSingleSelectionFood, values?.secondaryFoodId, form]);

  return (
    <Form onSubmit={handleSubmit} className={css.root}>
      <div className={css.fieldOnRow}>
        <FieldTextInput name="memberName" disabled className={css.input} />
        <div className="flex flex-col gap-2">
          <FieldDropdownSelect
            id="foodId"
            name="foodId"
            className={css.input}
            placeholder={intl.formatMessage({
              id: 'EditOrderRowForm.foodSelectField.placeholder',
            })}
            options={parsedFoodOptions}
          />
          <RenderWhen condition={isAllowAddSecondaryFood}>
            <FieldDropdownSelect
              disabled={isSingleSelectionFood}
              id="secondaryFoodId"
              name="secondaryFoodId"
              className={css.input}
              placeholder={intl.formatMessage({
                id: 'EditOrderRowForm.foodSelectField.placeholder',
              })}
              options={parsedFoodOptionsForSecondaryFood}
            />
          </RenderWhen>
        </div>
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

      <RenderWhen condition={shouldShowSecondaryRequirement}>
        <Button
          type="button"
          variant="inline"
          onClick={() =>
            setIsSecondaryRequirementInputShow(!isSecondaryRequirementInputShow)
          }
          className={css.buttonContainer}>
          <div className={css.buttonContent}>
            <RenderWhen condition={isSecondaryRequirementInputShow}>
              <IconMinus />
              <RenderWhen.False>
                <IconPlusWithoutBorder />
              </RenderWhen.False>
            </RenderWhen>
            <div>{currentSecondaryRequirementFieldActionText}</div>
          </div>
        </Button>

        {isSecondaryRequirementInputShow && (
          <div className={css.fieldRequirementContainer}>
            <FieldTextArea
              id="EditOrderRowForm.secondaryRequirement"
              name="secondaryRequirement"
              label={intl.formatMessage({
                id: 'EditOrderRowForm.requirementField.label',
              })}
              placeholder={intl.formatMessage({
                id: 'EditOrderRowForm.requirementField.placeholder',
              })}
            />
          </div>
        )}
      </RenderWhen>

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
