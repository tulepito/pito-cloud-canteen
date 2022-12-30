import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import { useAppDispatch } from '@hooks/reduxHooks';
import { updateDraftMealPlan } from '@redux/slices/Order.slice';
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
  // const {
  //   draftOrder: { clientId },
  // } = getPersistState('Order');
  const onSubmit = (values: any) => {
    const { deliveryAddress, perPack, ...rest } = values;
    const {
      selectedPlace: { address, origin },
    } = deliveryAddress;
    const createOrderValue = {
      deliveryAddress: {
        address,
        origin,
      },
      packagePerMember: perPack,
      ...rest,
    };
    dispatch(updateDraftMealPlan(createOrderValue));
  };
  const initialValues = {
    dayInWeek: [],
    perPack: '',
    vatAllow: true,
    pickAllow: true,
    participantSetup: ['allMembers'],
  };
  return (
    <FinalForm
      initialValues={initialValues}
      onSubmit={onSubmit}
      render={(formRenderProps: FormRenderProps) => {
        const { handleSubmit, form } = formRenderProps;
        return (
          <Form onSubmit={handleSubmit}>
            <div className={css.fieldSection}>
              <DeliveryAddressField />
            </div>
            <div className={css.fieldSection}>
              <PerPackageField />
            </div>
            <div className={css.fieldSection}>
              <MealPlanDateField />
              <div className={css.verticalSpace}>
                <DayInWeekField form={form} />
              </div>
            </div>
            {/* <NutritionField /> */}
            <div className={css.fieldSection}>
              <FoodPickingField />
              <div className={css.verticalSpace}>
                <ParticipantSetupField clientId="63a70ab5-9f10-40e0-876b-e35a692aa5f8" />
              </div>
            </div>

            <div className={css.buttonsWrapper}>
              <Button type="button" className={css.backBtn}>
                {intl.formatMessage({ id: 'MealPlanSetup.back' })}
              </Button>
              <Button type="submit" className={css.submitBtn}>
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
