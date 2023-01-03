import Form from '@components/Form/Form';
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

const MealPlanSetup: React.FC<any> = (props) => {
  const { goBack } = props;
  const onSubmit = (values: any) => {
    console.log('values: ', values);
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

            <NavigateButtons goBack={goBack} />
          </Form>
        );
      }}
    />
  );
};

export default MealPlanSetup;
