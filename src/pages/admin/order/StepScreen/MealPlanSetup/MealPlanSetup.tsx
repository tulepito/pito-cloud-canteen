import Form from '@components/Form/Form';
import { getPersistState } from '@helpers/persistHelper';
import { useAppDispatch } from '@hooks/reduxHooks';
import { updateDraftMealPlan } from '@redux/slices/Order.slice';
import { useMemo } from 'react';
import type { FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';

import DayInWeekField from '../../create/components/DayInWeekField/DayInWeekField';
import DeliveryAddressField from '../../create/components/DeliveryAddressField/DeliveryAddressField';
import FoodPickingField from '../../create/components/FoodPickingField/FoodPickingField';
import MealPlanDateField from '../../create/components/MealPlanDateField/MealPlanDateField';
// eslint-disable-next-line import/no-cycle
import NavigateButtons from '../../create/components/NavigateButtons/NavigateButtons';
import ParticipantSetupField from '../../create/components/ParticipantSetupField/ParticipantSetupField';
import PerPackageField from '../../create/components/PerPackageField/PerPackageField';
import css from './MealPlanSetup.module.scss';

type MealPlanSetupProps = {};
const MealPlanSetup: React.FC<MealPlanSetupProps> = () => {
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
        const { handleSubmit, form, values } = formRenderProps;
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

            <NavigateButtons goBack={() => {}} />
          </Form>
        );
      }}
    />
  );
};

export default MealPlanSetup;
