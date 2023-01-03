import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import { getPersistState } from '@helpers/persistHelper';
import { useAppDispatch } from '@hooks/reduxHooks';
import { updateDraftMealPlan } from '@redux/slices/Order.slice';
import { useMemo } from 'react';
import type { FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';

import DayInWeekField from '../../create/components/DayInWeekField/DayInWeekField';
import DeliveryAddressField from '../../create/components/DeliveryAddressField/DeliveryAddressField';
import FoodPickingField from '../../create/components/FoodPickingField/FoodPickingField';
import MealPlanDateField from '../../create/components/MealPlanDateField/MealPlanDateField';
import ParticipantSetupField from '../../create/components/ParticipantSetupField/ParticipantSetupField';
import PerPackageField from '../../create/components/PerPackageField/PerPackageField';
import css from './MealPlanSetup.module.scss';

type MealPlanSetupProps = {};
const MealPlanSetup: React.FC<MealPlanSetupProps> = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const {
    draftOrder: {
      clientId,
      dayInWeek,
      packagePerMember,
      vatAllow,
      pickAllow,
      participantSetup,
      deliveryHour,
      startDate,
      endDate,
      deliveryAddress,
    },
  } = getPersistState('Order');
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
  };
  const initialValues = useMemo(
    () => ({
      dayInWeek: dayInWeek || [],
      packagePerMember: packagePerMember || '',
      vatAllow: vatAllow || true,
      pickAllow: pickAllow || true,
      participantSetup: participantSetup || ['allMembers'],
      deliveryHour: deliveryHour || '',
      deliveryAddress: deliveryAddress
        ? {
            search: address,
            selectedPlace: { address, origin },
          }
        : null,
      startDate: startDate || '',
      endDate: endDate || '',
    }),
    [
      dayInWeek,
      packagePerMember,
      vatAllow,
      pickAllow,
      participantSetup,
      deliveryHour,
      deliveryAddress,
      address,
      origin,
      startDate,
      endDate,
    ],
  );
  return (
    <FinalForm
      initialValues={initialValues}
      onSubmit={onSubmit}
      render={(formRenderProps: FormRenderProps) => {
        const { handleSubmit, form, values, invalid } = formRenderProps;
        return (
          <Form onSubmit={handleSubmit}>
            <div className={css.fieldSection}>
              <DeliveryAddressField />
            </div>
            <div className={css.fieldSection}>
              <PerPackageField />
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
                <ParticipantSetupField clientId={clientId} />
              </div>
            </div>

            <div className={css.buttonsWrapper}>
              <Button type="button" className={css.backBtn}>
                {intl.formatMessage({ id: 'MealPlanSetup.back' })}
              </Button>
              <Button
                type="submit"
                className={css.submitBtn}
                disabled={invalid}>
                {intl.formatMessage({ id: 'MealPlanSetup.submit' })}
              </Button>
            </div>
          </Form>
        );
      }}
    />
  );
};

export default MealPlanSetup;
