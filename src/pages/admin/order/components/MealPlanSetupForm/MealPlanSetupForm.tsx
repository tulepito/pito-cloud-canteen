/* eslint-disable import/no-cycle */
import { useEffect } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';

import Form from '@components/Form/Form';
import DaySessionField from '@pages/company/booker/orders/new/quiz/meal-date/DaySessionField/DaySessionField';
import { getSelectedDaysOfWeek } from '@src/utils/dates';
import { EOrderType } from '@src/utils/enums';
import { User } from '@utils/data';
import type { TUser } from '@utils/types';

import DayInWeekField from '../DayInWeekField/DayInWeekField';
import DeliveryAddressField from '../DeliveryAddressField/DeliveryAddressField';
import DurationForNextOrderField from '../DurationForNextOrderField/DurationForNextOrderField';
import FoodPickingField from '../FoodPickingField/FoodPickingField';
import MealPlanDateField from '../MealPlanDateField/MealPlanDateField';
import MemberAmountField from '../MemberAmountField/MemberAmountField';
import { EFlowType } from '../NavigateButtons/NavigateButtons';
import NutritionField from '../NutritionField/NutritionField';
import OrderDeadlineField from '../OrderDeadlineField/OrderDeadlineField';
import ParticipantSetupField from '../ParticipantSetupField/ParticipantSetupField';
import PerPackageField from '../PerPackageField/PerPackageField';

import css from './MealPlanSetupForm.module.scss';

export type TMealPlanSetupFormValues = any;

type TExtraProps = {
  currentClient: TUser;
  selectedBooker: TUser;
  clientId: string;
  nutritionsOptions: {
    label: string;
    key: string;
  }[];
  flowType: EFlowType;
  formSubmitRef: any;
  setDraftEditValues: (value: any) => void;
  shouldDisableFields: boolean;
};
type TMealPlanSetupFormComponentProps =
  FormRenderProps<TMealPlanSetupFormValues> & Partial<TExtraProps>;
type TMealPlanSetupFormProps = FormProps<TMealPlanSetupFormValues> &
  TExtraProps;

const MealPlanSetupFormComponent: React.FC<TMealPlanSetupFormComponentProps> = (
  props,
) => {
  const {
    currentClient,
    selectedBooker,
    handleSubmit,
    values,
    form,
    clientId,
    nutritionsOptions,
    flowType,
    setDraftEditValues,
    formSubmitRef,
    shouldDisableFields = false,
  } = props;
  const intl = useIntl();

  formSubmitRef.current = handleSubmit;

  const isEditFlow = flowType === EFlowType.edit;
  const { pickAllow: pickAllowValue = true } = values;

  useEffect(() => {
    const {
      deliveryAddress: deliveryAddressValues,
      packagePerMember: packagePerMemberValue,
      pickAllow: pickAllowSubmitValue,
      deadlineDate: deadlineDateSubmitValue,
      deadlineHour: deadlineHourSubmitValue,
      selectedGroups: selectedGroupsSubmitValue,
      ...rest
    } = values;
    const {
      selectedPlace: { address: addressValue, origin: originValue },
    } = deliveryAddressValues;
    const selectedDayInWeek = getSelectedDaysOfWeek(
      values.startDate,
      values.endDate,
      values.dayInWeek,
    );
    const generalInfo = {
      ...rest,
      deliveryAddress: {
        address: addressValue,
        origin: originValue,
      },
      orderType: pickAllowSubmitValue ? EOrderType.group : EOrderType.normal,
      packagePerMember: packagePerMemberValue,
      selectedGroups: pickAllowSubmitValue ? selectedGroupsSubmitValue : [],
      deadlineDate: pickAllowSubmitValue ? deadlineDateSubmitValue : null,
      deadlineHour: pickAllowSubmitValue ? deadlineHourSubmitValue : null,
      pickAllow: pickAllowSubmitValue,
      dayInWeek: selectedDayInWeek,
    };
    if (isEditFlow && setDraftEditValues) setDraftEditValues(generalInfo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(values)]);

  return (
    <Form onSubmit={handleSubmit}>
      <div className={css.headerLabel}>
        {intl.formatMessage(
          { id: 'MealPlanSetup.headerLabel' },
          {
            companyName: User(currentClient!).getPublicData().companyName,
            bookerName: User(selectedBooker!).getProfile().displayName,
          },
        )}
      </div>
      <div className={css.fieldSection}>
        <DeliveryAddressField
          title={intl.formatMessage({ id: 'DeliveryAddressField.title' })}
          disabled={shouldDisableFields}
        />
      </div>
      <div className={css.fieldSection}>
        <PerPackageField
          title={intl.formatMessage({ id: 'PerPackageField.title' })}
          disabled={shouldDisableFields}
        />
        <div className={css.verticalSpace}>
          <MemberAmountField
            title={intl.formatMessage({ id: 'MemberAmountField.title' })}
            disabled={shouldDisableFields}
          />
        </div>
      </div>
      <div className={css.fieldSection}>
        <NutritionField
          disabled={shouldDisableFields}
          title={intl.formatMessage({ id: 'NutritionField.title' })}
          options={nutritionsOptions}
        />
      </div>
      <div className={css.fieldSection}>
        <MealPlanDateField
          form={form}
          disabled={shouldDisableFields}
          values={values}
          title={intl.formatMessage({ id: 'MealPlanDateField.title' })}
        />
        <DaySessionField
          form={form}
          disabled={shouldDisableFields}
          values={values}
          containerClassName={css.fieldSection}
          titleClassName={css.fieldTitle}
        />
        <div className={css.verticalSpace}>
          <DayInWeekField
            form={form}
            disabled={shouldDisableFields}
            values={values}
            title={intl.formatMessage({ id: 'DayInWeekField.label' })}
          />
        </div>

        <div className={css.verticalSpace}>
          <DurationForNextOrderField
            form={form}
            disabled={shouldDisableFields}
            displayedDurationTimeValue={values.displayedDurationTime}
            title={intl.formatMessage({
              id: 'DurationForNextOrderField.label',
            })}
          />
        </div>
      </div>

      <div className={css.fieldSection}>
        <FoodPickingField disabled={shouldDisableFields} />
        {pickAllowValue && (
          <div className={css.verticalSpace}>
            <OrderDeadlineField
              title={intl.formatMessage({
                id: 'OrderDeadlineField.title',
              })}
              form={form}
              values={values}
              disabled={shouldDisableFields}
            />
          </div>
        )}
        {pickAllowValue && (
          <div className={css.verticalSpace}>
            <ParticipantSetupField
              form={form}
              disabled={shouldDisableFields}
              clientId={clientId!}
              title={intl.formatMessage({
                id: 'ParticipantSetupField.title',
              })}
            />
          </div>
        )}
      </div>
    </Form>
  );
};

const MealPlanSetupForm: React.FC<TMealPlanSetupFormProps> = (props) => {
  return <FinalForm {...props} component={MealPlanSetupFormComponent} />;
};

export default MealPlanSetupForm;
