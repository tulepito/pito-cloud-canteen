import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import arrayMutators from 'final-form-arrays';

import Form from '@components/Form/Form';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import type { TEditPartnerFoodFormValues } from '@pages/admin/partner/[restaurantId]/settings/food/utils';

import {
  FOOD_ADDITIONAL_INFO_TAB,
  FOOD_BASIC_INFO_TAB,
  FOOD_DETAIL_INFO_TAB,
} from '../../create/CreatePartnerFood.page';
import FoodAdditionalInfoTabFormPart from '../FoodAdditionalInfoTab/FoodAdditionalInfoTabFormPart';
import FoodBasicInforTabFormPart from '../FoodBasicInfoTab/FoodBasicInforTabFormPart';
import FoodDetailInforTabFormPart from '../FoodDetailInfoTab/FoodDetailInforTabFormPart';

type TExtraProps = {
  currentTab: string;
  inProgress?: boolean;
  onTabBack?: () => void;
};
type TEditPartnerFoodFormMobileComponentProps =
  FormRenderProps<TEditPartnerFoodFormValues> & Partial<TExtraProps>;
type TEditPartnerFoodFormMobileProps = FormProps<TEditPartnerFoodFormValues> &
  TExtraProps;

const EditPartnerFoodFormMobileComponent: React.FC<
  TEditPartnerFoodFormMobileComponentProps
> = (props) => {
  const {
    handleSubmit,
    currentTab,
    form,
    invalid,
    inProgress,
    values,
    onTabBack,
  } = props;

  const onSubmit = (e: any) => {
    if (currentTab === FOOD_DETAIL_INFO_TAB) {
      e.preventDefault();
    } else {
      handleSubmit(e);
    }
  };

  return (
    <Form onSubmit={onSubmit}>
      <RenderWhen condition={currentTab === FOOD_BASIC_INFO_TAB}>
        <FoodBasicInforTabFormPart invalid={invalid} inProgress={inProgress} />
      </RenderWhen>
      <RenderWhen condition={currentTab === FOOD_DETAIL_INFO_TAB}>
        <FoodDetailInforTabFormPart
          form={form}
          invalid={invalid}
          handleSubmit={handleSubmit as any}
          values={values}
          onTabBack={onTabBack}
        />
      </RenderWhen>
      <RenderWhen condition={currentTab === FOOD_ADDITIONAL_INFO_TAB}>
        <FoodAdditionalInfoTabFormPart
          invalid={invalid}
          inProgress={inProgress}
          onTabBack={onTabBack}
        />
      </RenderWhen>
    </Form>
  );
};

const EditPartnerFoodFormMobile: React.FC<TEditPartnerFoodFormMobileProps> = (
  props,
) => {
  return (
    <FinalForm
      {...props}
      component={EditPartnerFoodFormMobileComponent}
      mutators={{ ...arrayMutators }}
    />
  );
};

export default EditPartnerFoodFormMobile;
