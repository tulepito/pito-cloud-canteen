import { Field } from 'react-final-form';

import FieldCheckbox from '@components/FormFields/FieldCheckbox/FieldCheckbox';
import IconLightOutline from '@components/Icons/IconLightOutline/IconLightOutline';
import NamedLink from '@components/NamedLink/NamedLink';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import Toggle from '@components/Toggle/Toggle';
import { useAppDispatch } from '@hooks/reduxHooks';
import { partnerPaths } from '@src/paths';
import { Listing } from '@src/utils/data';
import { EFoodApprovalState } from '@src/utils/enums';
import type { TListing } from '@src/utils/types';

import { partnerFoodSliceThunks } from '../../PartnerFood.slice';

import css from './FoodRow.module.scss';

type TFoodRowProps = {
  id: string;
  name: string;
  food: TListing;
  foodApprovalActiveTab: EFoodApprovalState;
  setFoodToRemove: (params: any) => void;
  setSelectedFood: (food: TListing) => void;
  openManipulateFoodModal: () => void;
};

const FoodRow: React.FC<TFoodRowProps> = (props) => {
  const {
    id,
    name,
    food,
    setSelectedFood,
    openManipulateFoodModal,
    foodApprovalActiveTab,
  } = props;
  const dispatch = useAppDispatch();

  const foodListing = Listing(food);
  const foodId = foodListing.getId();
  const { title: foodName } = foodListing.getAttributes();
  const isFoodAcceptedTab =
    foodApprovalActiveTab === EFoodApprovalState.ACCEPTED;

  const checkBoxContent = (
    <NamedLink
      path={partnerPaths.EditFood.replace('[foodId]', foodId)}
      params={{ fromTab: foodApprovalActiveTab }}>
      <div className={css.contentWrapper}>{foodName}</div>
    </NamedLink>
  );

  const handleActionsBtnClick = () => {
    setSelectedFood(food);
    openManipulateFoodModal();
  };

  const handleToggleFoodEnable = (input: any) => (value: any) => {
    dispatch(
      partnerFoodSliceThunks.toggleFoodEnabled({
        foodId,
        action: value ? 'enable' : 'disable',
      }),
    );
    input.onChange(value);
  };

  return (
    <div className={css.root}>
      <FieldCheckbox
        id={id}
        name={name}
        value={foodId}
        label={checkBoxContent}
        labelClassName={css.checkboxLabel}
        textClassName={css.checkboxText}
        checkboxWrapperClassName={css.checkboxWrapper}
      />
      <RenderWhen condition={!!isFoodAcceptedTab}>
        <Field id={`foodEnable-${foodId}`} name={`foodEnable-${foodId}`}>
          {(fieldProps) => {
            const { input } = fieldProps;

            return (
              <Toggle
                id={'MealDateForm.orderType'}
                status={input.value ? 'on' : 'off'}
                className={css.toggle}
                onClick={(value) => {
                  handleToggleFoodEnable(input)(value);
                }}
              />
            );
          }}
        </Field>
      </RenderWhen>
      <div className={css.actionsWrapper} onClick={handleActionsBtnClick}>
        <IconLightOutline />
      </div>
    </div>
  );
};

export default FoodRow;
