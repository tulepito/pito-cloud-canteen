import { useRouter } from 'next/router';

import ClientSelector from '../StepScreen/ClientSelector/ClientSelector';
import MealPlanCreator from '../StepScreen/MealPlanCreator/MealPlanCreator';
import MealPlanSetup from '../StepScreen/MealPlanSetup/MealPlanSetup';

const CreateOrderPage = () => {
  const router = useRouter();
  const { step } = router.query;
  const getStepContent = () => {
    switch (step) {
      case 'clientSelect':
        return <ClientSelector />;
      case 'mealPlanSetup':
        return <MealPlanSetup />;
      case 'createMealPlan':
        return <MealPlanCreator />;
      case 'serviceFeeAndNote':
        return <div>Service fee and note</div>;
      case 'review':
        return <div>Review and order</div>;
      default:
        break;
    }
  };
  return <div>{getStepContent()}</div>;
};

export default CreateOrderPage;
