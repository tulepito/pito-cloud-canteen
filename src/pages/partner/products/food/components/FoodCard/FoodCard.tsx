import Badge, { EBadgeType } from '@components/Badge/Badge';
import FieldCheckbox from '@components/FormFields/FieldCheckbox/FieldCheckbox';
import IconLightOutline from '@components/Icons/IconLightOutline/IconLightOutline';
import NamedLink from '@components/NamedLink/NamedLink';
import OutsideClickHandler from '@components/OutsideClickHandler/OutsideClickHandler';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import ResponsiveImage from '@components/ResponsiveImage/ResponsiveImage';
import useBoolean from '@hooks/useBoolean';
import { partnerPaths } from '@src/paths';
import { Listing } from '@src/utils/data';
import {
  EImageVariants,
  FOOD_TYPE_OPTIONS,
  getLabelByKey,
  MENU_OPTIONS,
  SPECIAL_DIET_OPTIONS,
} from '@src/utils/enums';
import type { TListing } from '@src/utils/types';

import css from './FoodCard.module.scss';

type TFoodCardProps = {
  id: string;
  name: string;
  food: TListing;
  setFoodToRemove: (params: any) => void;
};

const FoodCard: React.FC<TFoodCardProps> = (props) => {
  const { id, name, food, setFoodToRemove } = props;
  const actionController = useBoolean();

  const foodListing = Listing(food);
  const foodId = foodListing.getId();

  const foodImage = foodListing.getImages()[0] || null;

  const { title: foodName } = foodListing.getAttributes();
  const { menuType, foodType, specialDiets = [] } = foodListing.getPublicData();

  const checkBoxContent = (
    <NamedLink path={partnerPaths.EditFood.replace('[foodId]', foodId)}>
      <div className={css.contentWrapper}>
        <div className={css.image}>
          <ResponsiveImage
            image={foodImage}
            alt={foodName}
            variants={[EImageVariants.squareSmall2x]}
          />
        </div>
        <div className={css.content}>
          <div className={css.infoWrapper}>
            <div className={css.foodName} title={foodName}>
              {foodName}
            </div>
            <div className={css.menuType}>
              {getLabelByKey(MENU_OPTIONS, menuType)}
            </div>
          </div>
          <div className={css.bottomWrapper}>
            <div className={css.foodType}>
              <RenderWhen condition={!!specialDiets[0]}>
                <Badge
                  type={EBadgeType.info}
                  label={getLabelByKey(SPECIAL_DIET_OPTIONS, specialDiets[0])}
                />
              </RenderWhen>
              <Badge
                type={EBadgeType.success}
                label={getLabelByKey(FOOD_TYPE_OPTIONS, foodType)}
              />
            </div>
          </div>
        </div>
      </div>
    </NamedLink>
  );

  const handleRemoveFood = () => {
    actionController.setFalse();
    setFoodToRemove({ id: foodId, title: foodName });
  };

  return (
    <div className={css.cardWrapper}>
      <FieldCheckbox
        id={id}
        name={name}
        value={foodId}
        label={checkBoxContent}
        labelClassName={css.checkboxLabel}
        textClassName={css.checkboxText}
        checkboxWrapperClassName={css.checkboxWrapper}
      />
      <div className={css.actionsWrapper} onClick={actionController.setTrue}>
        <IconLightOutline />

        <RenderWhen condition={actionController.value}>
          <OutsideClickHandler
            onOutsideClick={actionController.setFalse}
            className={css.actionsBtnWrapper}>
            <>
              <NamedLink
                path={partnerPaths.EditFood.replace('[foodId]', foodId)}>
                <div className={css.item}>Chỉnh sửa</div>
              </NamedLink>
              <div className={css.item} onClick={handleRemoveFood}>
                Xóa
              </div>
            </>
          </OutsideClickHandler>
        </RenderWhen>
      </div>
    </div>
  );
};

export default FoodCard;
