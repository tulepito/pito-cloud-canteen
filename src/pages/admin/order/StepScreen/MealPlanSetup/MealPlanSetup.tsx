import Form from '@components/Form/Form';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { updateDraftMealPlan } from '@redux/slices/Order.slice';
import { useMemo } from 'react';
import type { FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';

import DayInWeekField from '../../create/components/DayInWeekField/DayInWeekField';
import DeliveryAddressField from '../../create/components/DeliveryAddressField/DeliveryAddressField';
import FoodPickingField from '../../create/components/FoodPickingField/FoodPickingField';
import MealPlanDateField from '../../create/components/MealPlanDateField/MealPlanDateField';
// eslint-disable-next-line import/no-cycle
import NavigateButtons from '../../create/components/NavigateButtons/NavigateButtons';
import OrderDealineField from '../../create/components/OrderDealineField/OrderDealineField';
import ParticipantSetupField from '../../create/components/ParticipantSetupField/ParticipantSetupField';
import PerPackageField from '../../create/components/PerPackageField/PerPackageField';
import css from './MealPlanSetup.module.scss';

type MealPlanSetupProps = {
  goBack: () => void;
  nextTab: () => void;
};
const MealPlanSetup: React.FC<MealPlanSetupProps> = (props) => {
  const { goBack, nextTab } = props;
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const {
    draftOrder: {
      clientId,
      dayInWeek,
      packagePerMember,
      vatAllow,
      pickAllow,
      selectedGroups,
      deliveryHour,
      startDate,
      endDate,
      deliveryAddress,
      deadlineDate,
      deadlineHour,
    },
  } = useAppSelector((state) => state.Order, shallowEqual);
  const { address, origin } = deliveryAddress || {};
  const onSubmit = (values: any) => {
    const { deliveryAddress: deliveryAddressValues, ...rest } = values;
    const {
      selectedPlace: { address: addressValue, origin: originValue },
    } = deliveryAddressValues;
    const createOrderValue = {
      deliveryAddress: {
        address: addressValue,
        origin: originValue,
      },
      ...rest,
    };
    dispatch(updateDraftMealPlan(createOrderValue));
    nextTab();
  };
  const initialValues = useMemo(
    () => ({
      dayInWeek: dayInWeek || [],
      packagePerMember: packagePerMember || '',
      vatAllow: vatAllow || true,
      pickAllow: pickAllow || true,
      selectedGroups: selectedGroups || ['allMembers'],
      deliveryHour: deliveryHour || '',
      deliveryAddress: deliveryAddress
        ? {
            search: address,
            selectedPlace: { address, origin },
          }
        : null,
      startDate: startDate || '',
      endDate: endDate || '',
      deadlineDate: deadlineDate || null,
      deadlineHour: deadlineHour || null,
    }),
    [
      dayInWeek,
      packagePerMember,
      vatAllow,
      pickAllow,
      selectedGroups,
      deliveryHour,
      deliveryAddress,
      address,
      origin,
      startDate,
      endDate,
      deadlineDate,
      deadlineHour,
    ],
  );
  return (
    <FinalForm
      initialValues={initialValues}
      onSubmit={onSubmit}
      render={(formRenderProps: FormRenderProps) => {
        const { handleSubmit, form, values } = formRenderProps;
        return (
          <Form onSubmit={handleSubmit}>
            <div className={css.fieldSection}>
              <DeliveryAddressField
                title={intl.formatMessage({ id: 'DeliveryAddressField.title' })}
              />
            </div>
            <div className={css.fieldSection}>
              <PerPackageField
                title={intl.formatMessage({ id: 'PerPackageField.title' })}
              />
            </div>
            <div className={css.fieldSection}>
              <MealPlanDateField form={form} values={values} />
              <div className={css.verticalSpace}>
                <DayInWeekField form={form} values={values} />
              </div>
            </div>
            {/* <NutritionField /> */}
            <div className={css.fieldSection}>
              <FoodPickingField />
              <div className={css.verticalSpace}>
                <OrderDealineField
                  title={intl.formatMessage({ id: 'OrderDealineField.title' })}
                  form={form}
                  values={values}
                />
              </div>
              <div className={css.verticalSpace}>
                <ParticipantSetupField
                  clientId={clientId}
                  title={intl.formatMessage({
                    id: 'ParticipantSetupField.title',
                  })}
                />
              </div>
            </div>

            <NavigateButtons goBack={goBack} />
          </Form>
        );
      }}
    />
  );
};

export default MealPlanSetup;
