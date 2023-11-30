/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Field, Form as FinalForm } from 'react-final-form';
import { OnChange } from 'react-final-form-listeners';
import { useIntl } from 'react-intl';
import isEmpty from 'lodash/isEmpty';

import Button from '@components/Button/Button';
import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import Form from '@components/Form/Form';
import FieldCustomSelectComponent from '@components/FormFields/FieldCustomSelect/FieldCustomSelect';
import FieldDropdownSelect from '@components/FormFields/FieldDropdownSelect/FieldDropdownSelect';
import FieldTextArea from '@components/FormFields/FieldTextArea/FieldTextArea';
import IconMinus from '@components/Icons/IconMinus/IconMinus';
import IconPlusWithoutBorder from '@components/Icons/IconPlusWithoutBorder/IconPlusWithoutBorder';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  orderDetailsAnyActionsInProgress,
  OrderManagementsAction,
} from '@redux/slices/OrderManagement.slice';
import type { TObject } from '@src/utils/types';
import { EMAIL_RE, VALID } from '@src/utils/validators';
import { shortenString } from '@utils/string';

import css from './AddOrderForm.module.scss';

export type TAddOrderFormValues = {
  participantId: { key: string; label: string };
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
  ableToUpdateOrder: boolean;
  isDraftEditing: boolean;
  maxQuantity?: number;
  minQuantity?: number;
  currentViewDate: number;
  planReachMaxRestaurantQuantity?: boolean;
  planReachMinRestaurantQuantity?: boolean;
  planReachMaxCanModify?: boolean;
};
type TAddOrderFormComponentProps = FormRenderProps<TAddOrderFormValues> &
  Partial<TExtraProps>;
type TAddOrderFormProps = FormProps<TAddOrderFormValues> & TExtraProps;

const AddOrderFormComponent: React.FC<TAddOrderFormComponentProps> = (
  props,
) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const inProgress = useAppSelector(orderDetailsAnyActionsInProgress);
  const addOrUpdateMemberOrderInProgress = useAppSelector(
    (state) => state.OrderManagement.addOrUpdateMemberOrderInProgress,
  );
  const addOrUpdateMemberOrderError = useAppSelector(
    (state) => state.OrderManagement.addOrUpdateMemberOrderError,
  );

  const {
    foodOptions,
    memberOptions = [],
    handleSubmit,
    form,
    submitErrors,
    values,
    invalid,
    ableToUpdateOrder,
    isDraftEditing,
    planReachMaxRestaurantQuantity,
    planReachMinRestaurantQuantity,
    planReachMaxCanModify,
    minQuantity,
    maxQuantity,
    currentViewDate,
  } = props;

  const fieldSelectMemberDisable = inProgress || !ableToUpdateOrder;
  const fieldSelectFoodDisable =
    fieldSelectMemberDisable || foodOptions?.length === 0;
  const submitDisabled =
    invalid ||
    addOrUpdateMemberOrderInProgress ||
    fieldSelectFoodDisable ||
    !values?.participantId ||
    !values?.foodId;

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

  const participantIdFieldInvalidMessage = intl.formatMessage({
    id: 'AddOrderForm.participantIdField.invalid',
  });

  const handleToggleShowHideRequirementField = () => {
    setIsRequirementInputShow(!isRequirementInputShow);
  };

  useEffect(() => {
    if (currentViewDate && form) {
      form.reset();
    }
  }, [currentViewDate]);

  useEffect(() => {
    if (isRequirementInputShow) {
      setCurrentRequirementFieldActionText(hideRequirementText);
    } else {
      setCurrentRequirementFieldActionText(showRequirementText);
    }
  }, [isRequirementInputShow]);

  const selectMemberOptions = useMemo(
    () =>
      memberOptions?.map(({ memberId, memberName }) => ({
        key: memberId,
        label: memberName,
      })) || [],
    [JSON.stringify(memberOptions)],
  );

  const parsedFoodOptions = foodOptions?.map((f) => ({
    label: shortenString(f.foodName, 18),
    key: f.foodId,
  }));

  const customHandleSubmit = (event: any) => {
    return handleSubmit(event)?.then((submitResult) => {
      form.reset();

      return { submitResult };
    });
  };

  const validateMemberField = (value: TObject) => {
    if (!value) {
      return VALID;
    }

    const inInListValue =
      selectMemberOptions.findIndex((o) => o?.key === value?.key) !== -1;
    if (inInListValue || EMAIL_RE.test(value?.key)) {
      return VALID;
    }

    return participantIdFieldInvalidMessage;
  };

  const handleFieldParticipantChange = (
    _newValue: TObject,
    _oldValue: TObject,
  ) => {
    // Exception case for form.reset()
    if ((_newValue === null || isEmpty(_newValue)) && !values?.foodId) {
      return;
    }
    dispatch(OrderManagementsAction.clearAddUpdateParticipantError());
  };

  return (
    <Form onSubmit={customHandleSubmit} className={css.root}>
      <div className={css.fieldsContainer}>
        <div className={css.fieldContainer}>
          <OnChange name="participantId">
            {handleFieldParticipantChange}
          </OnChange>
          <Field
            disabled={fieldSelectMemberDisable}
            id={'addOrder.participantName'}
            name="participantId"
            className={css.fieldSelect}
            component={FieldCustomSelectComponent}
            options={selectMemberOptions}
            placeholder={intl.formatMessage({
              id: 'AddOrderForm.participantIdField.placeholder',
            })}
            activePlaceholder={intl.formatMessage({
              id: 'AddOrderForm.participantIdField.activePlaceholder',
            })}
            formatCreateLabel={(value: string) =>
              intl.formatMessage(
                {
                  id: 'AddOrderForm.participantIdField.createOption',
                },
                { value },
              )
            }
            formError={submitErrors?.participantId}
            validate={validateMemberField}
            validateErrorClassName={css.fieldParticipantIdError}
            newOptionValidator={isDraftEditing ? () => false : undefined}
          />
          {addOrUpdateMemberOrderError !== null && (
            <div className={css.formError}>
              {'Người dùng không có trên hệ thống'}
            </div>
          )}
        </div>
        <div className={css.fieldContainer}>
          <FieldDropdownSelect
            className={css.fieldSelect}
            dropdownWrapperClassName={css.fieldSelectDropdownWrapper}
            options={parsedFoodOptions}
            disabled={fieldSelectFoodDisable}
            id={'addOrder.foodId'}
            name="foodId"
            placeholder={intl.formatMessage({
              id: 'AddOrderForm.foodIdField.placeholder',
            })}
            fieldWrapperClassName={css.fieldSelectWrapper}
          />
        </div>
        <Button
          disabled={submitDisabled}
          inProgress={addOrUpdateMemberOrderInProgress}
          className={css.submitButton}>
          {intl.formatMessage({
            id: 'AddOrderForm.submitButtonText',
          })}
        </Button>
      </div>
      {planReachMaxCanModify && (
        <ErrorMessage
          className={css.error}
          message={`Bạn đã thay đổi vượt mức quy định (tối đa 10% số lượng người tham gia)`}
        />
      )}
      {planReachMaxRestaurantQuantity && (
        <ErrorMessage
          className={css.error}
          message={`Bạn đã đặt vượt mức tối đa (${maxQuantity} phần)`}
        />
      )}
      {planReachMinRestaurantQuantity && (
        <ErrorMessage
          className={css.error}
          message={`Cần đặt tối thiểu ${minQuantity} phần`}
        />
      )}

      <div className={css.addRequirementContainer}>
        <Button
          type="button"
          variant="inline"
          disabled={fieldSelectFoodDisable}
          onClick={handleToggleShowHideRequirementField}
          className={css.toggleRequirementBtn}>
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
              disabled={!ableToUpdateOrder}
            />
          </div>
        )}
      </div>

      <Button
        disabled={submitDisabled}
        inProgress={addOrUpdateMemberOrderInProgress}
        className={css.mobileSubmitButton}>
        {intl.formatMessage({
          id: 'AddOrderForm.submitButtonText',
        })}
      </Button>
    </Form>
  );
};

const AddOrderForm: React.FC<TAddOrderFormProps> = (props) => {
  return <FinalForm {...props} component={AddOrderFormComponent} />;
};

export default AddOrderForm;
