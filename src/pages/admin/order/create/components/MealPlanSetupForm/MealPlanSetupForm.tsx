import Form from '@components/Form/Form';
import { useAppSelector } from '@hooks/reduxHooks';
import { User } from '@utils/data';
import type { TUser } from '@utils/types';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';

import DayInWeekField from '../DayInWeekField/DayInWeekField';
import DeliveryAddressField from '../DeliveryAddressField/DeliveryAddressField';
import DurationForNextOrderField from '../DurationForNextOrderField/DurationForNextOrderField';
import FoodPickingField from '../FoodPickingField/FoodPickingField';
import MealPlanDateField from '../MealPlanDateField/MealPlanDateField';
import MemberAmountField from '../MemberAmountField/MemberAmountField';
// eslint-disable-next-line import/no-cycle
import NavigateButtons from '../NavigateButtons/NavigateButtons';
import NutritionField from '../NutritionField/NutritionField';
import OrderDeadlineField from '../OrderDeadlineField/OrderDeadlineField';
import ParticipantSetupField from '../ParticipantSetupField/ParticipantSetupField';
import PerPackageField from '../PerPackageField/PerPackageField';
import css from './MealPlanSetupForm.module.scss';

export type TMealPlanSetupFormValues = {
  pickAllow: boolean;
  displayedDurationTime: string;
};

type TExtraProps = {
  currentClient: TUser;
  selectedBooker: TUser;
  clientId: string;
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
  } = props;
  const intl = useIntl();
  const step2SubmitInProgress = useAppSelector(
    (state) => state.Order.step2SubmitInProgress,
  );

  const { pickAllow: pickAllowValue = true } = values;
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
        />
      </div>
      <div className={css.fieldSection}>
        <PerPackageField
          title={intl.formatMessage({ id: 'PerPackageField.title' })}
        />
        <div className={css.verticalSpace}>
          <MemberAmountField
            title={intl.formatMessage({ id: 'MemberAmountField.title' })}
          />
        </div>
      </div>
      <div className={css.fieldSection}>
        <NutritionField
          title={intl.formatMessage({ id: 'NutritionField.title' })}
        />
      </div>
      <div className={css.fieldSection}>
        <MealPlanDateField
          form={form}
          values={values}
          title={intl.formatMessage({ id: 'MealPlanDateField.title' })}
        />
        <div className={css.verticalSpace}>
          <DayInWeekField form={form} values={values} />
        </div>

        <div className={css.verticalSpace}>
          <DurationForNextOrderField
            form={form}
            displayedDurationTimeValue={values.displayedDurationTime}
          />
        </div>
      </div>

      <div className={css.fieldSection}>
        <FoodPickingField />
        {pickAllowValue && (
          <div className={css.verticalSpace}>
            <OrderDeadlineField
              title={intl.formatMessage({
                id: 'OrderDeadlineField.title',
              })}
              form={form}
              values={values}
            />
          </div>
        )}
        {pickAllowValue && (
          <div className={css.verticalSpace}>
            <ParticipantSetupField
              form={form}
              clientId={clientId!}
              title={intl.formatMessage({
                id: 'ParticipantSetupField.title',
              })}
            />
          </div>
        )}
      </div>

      <NavigateButtons inProgress={step2SubmitInProgress} />
    </Form>
  );
};

const MealPlanSetupForm: React.FC<TMealPlanSetupFormProps> = (props) => {
  return <FinalForm {...props} component={MealPlanSetupFormComponent} />;
};

export default MealPlanSetupForm;
