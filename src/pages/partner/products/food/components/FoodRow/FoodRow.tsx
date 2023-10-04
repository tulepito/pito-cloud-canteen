import FieldCheckbox from '@components/FormFields/FieldCheckbox/FieldCheckbox';
import IconLightOutline from '@components/Icons/IconLightOutline/IconLightOutline';
import NamedLink from '@components/NamedLink/NamedLink';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import Toggle from '@components/Toggle/Toggle';
import { partnerPaths } from '@src/paths';
import { Listing } from '@src/utils/data';
import type { TListing } from '@src/utils/types';

import css from './FoodRow.module.scss';

type TFoodRowProps = {
  id: string;
  name: string;
  food: TListing;
  isFoodAcceptedTab: boolean;
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
    isFoodAcceptedTab,
  } = props;

  const foodListing = Listing(food);
  const foodId = foodListing.getId();
  const { title: foodName } = foodListing.getAttributes();

  const checkBoxContent = (
    <NamedLink path={partnerPaths.EditFood.replace('[foodId]', foodId)}>
      <div className={css.contentWrapper}>{foodName}</div>
    </NamedLink>
  );

  const handleActionsBtnClick = () => {
    setSelectedFood(food);
    openManipulateFoodModal();
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
        <Toggle
          id="foodEnable"
          name="foodEnable"
          // status={input.value ? 'on' : 'off'}
          onClick={(value) => {
            console.log(value);
          }}
          className={css.toggle}
        />
      </RenderWhen>
      <div className={css.actionsWrapper} onClick={handleActionsBtnClick}>
        <IconLightOutline />
      </div>
    </div>
  );
};

export default FoodRow;
