import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import type { FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';

import DeliveryAddressField from '../../create/components/DeliveryAddressField/DeliveryAddressField';
import FoodPickingField from '../../create/components/FoodPickingField/FoodPickingField';
import MealPlanDateField from '../../create/components/MealPlanDateField/MealPlanDateField';
import NutritionField from '../../create/components/NutritionField/NutritionField';
import PerPackageField from '../../create/components/PerPackageField/PerPackageField';

type MealPlanSetupProps = {};

const MealPlanSetup: React.FC<MealPlanSetupProps> = () => {
  const onSubmit = (values: any) => {
    console.log('values: ', values);
  };
  return (
    <FinalForm
      onSubmit={onSubmit}
      render={(formRenderProps: FormRenderProps) => {
        const { handleSubmit } = formRenderProps;
        return (
          <Form onSubmit={handleSubmit}>
            <DeliveryAddressField />
            <PerPackageField />
            <NutritionField />
            <MealPlanDateField />
            <FoodPickingField />
            <Button type="submit">Submit</Button>
          </Form>
        );
      }}
    />
  );
};

export default MealPlanSetup;
