import { useAppDispatch } from '@hooks/reduxHooks';
import { manageCompaniesThunks } from '@redux/slices/ManageCompaniesPage.slice';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import ClientSelector from '../StepScreen/ClientSelector/ClientSelector';
import MealPlanCreator from '../StepScreen/MealPlanCreator/MealPlanCreator';
import MealPlanSetup from '../StepScreen/MealPlanSetup/MealPlanSetup';

const CreateOrderPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { step } = router.query;
  useEffect(() => {
    dispatch(manageCompaniesThunks.queryCompanies());
  }, []);
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
