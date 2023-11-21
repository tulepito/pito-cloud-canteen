import { useEffect } from 'react';
import { Field } from 'react-final-form';
import classNames from 'classnames';
import { useRouter } from 'next/router';

import Badge, { EBadgeType } from '@components/Badge/Badge';
import { InlineTextButton } from '@components/Button/Button';
import FieldCheckbox from '@components/FormFields/FieldCheckbox/FieldCheckbox';
import IconLightOutline from '@components/Icons/IconLightOutline/IconLightOutline';
import NamedLink from '@components/NamedLink/NamedLink';
import OutsideClickHandler from '@components/OutsideClickHandler/OutsideClickHandler';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import ResponsiveImage from '@components/ResponsiveImage/ResponsiveImage';
import Toggle from '@components/Toggle/Toggle';
import { parseThousandNumber } from '@helpers/format';
import { useAppDispatch } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { useViewport } from '@hooks/useViewport';
import { partnerPaths } from '@src/paths';
import { Listing } from '@src/utils/data';
import {
  EFoodApprovalState,
  EImageVariants,
  FOOD_APPROVAL_STATE_OPTIONS,
} from '@src/utils/enums';
import { FOOD_TYPE_OPTIONS, getLabelByKey } from '@src/utils/options';
import type { TListing } from '@src/utils/types';

import { partnerFoodSliceThunks } from '../../PartnerFood.slice';

import css from './FoodCard.module.scss';

type TFoodCardProps = {
  id: string;
  name: string;
  food: TListing;
  editableFoodMap: Record<string, boolean>;
  foodApprovalActiveTab: string;
  setFoodToRemove: (params: any) => void;
  setSelectedFood: (food: TListing) => void;
  openManipulateFoodModal: () => void;
};

const getApprovalStateType = (approvalState: EFoodApprovalState) => {
  switch (approvalState) {
    case EFoodApprovalState.ACCEPTED:
      return EBadgeType.success;
    case EFoodApprovalState.PENDING:
      return EBadgeType.warning;
    case EFoodApprovalState.DECLINED:
      return EBadgeType.danger;
    default:
      return EBadgeType.success;
  }
};

const FoodCard: React.FC<TFoodCardProps> = (props) => {
  const {
    id,
    name,
    food,
    setFoodToRemove,
    setSelectedFood,
    openManipulateFoodModal,
    editableFoodMap,
    foodApprovalActiveTab,
  } = props;
  const actionController = useBoolean();
  const { isMobileLayout } = useViewport();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const isFoodAcceptedTab =
    foodApprovalActiveTab === EFoodApprovalState.ACCEPTED;

  const foodListing = Listing(food);
  const foodId = foodListing.getId();

  const foodImage = foodListing.getImages()[0] || null;

  const { title: foodName } = foodListing.getAttributes();
  const { foodType, unit } = foodListing.getPublicData();
  const { adminApproval } = foodListing.getMetadata();
  const { price } = foodListing.getAttributes();
  const images = foodListing.getImages();

  const onReApprovalFood = async (e: any) => {
    e.stopPropagation();
    await dispatch(partnerFoodSliceThunks.reApprovalFood({ foodId }));
    await dispatch(
      partnerFoodSliceThunks.fetchApprovalFoods(EFoodApprovalState.DECLINED),
    );
    await dispatch(
      partnerFoodSliceThunks.fetchApprovalFoods(EFoodApprovalState.PENDING),
    );
  };

  const handleRedirect = () => {
    if (!editableFoodMap[foodId]) {
      return;
    }
    router.push({
      pathname: partnerPaths.EditFood.replace('[foodId]', foodId),
      query: { fromTab: foodApprovalActiveTab },
    });
  };

  const checkBoxContent = (
    <div
      className={classNames(css.card, !editableFoodMap[foodId] && css.disabled)}
      onClick={handleRedirect}>
      <div className={css.contentWrapper}>
        <div className={css.image}>
          <ResponsiveImage
            image={foodImage}
            alt={foodName}
            variants={[EImageVariants.squareSmall2x]}
          />
          <div className={css.imageAmountLabel}>{`${images.length}/5`}</div>
        </div>
        <div className={css.content}>
          <div className={css.infoWrapper}>
            <div className={css.foodName} title={foodName}>
              {foodName}
            </div>
            <div className={css.menuType}>
              <div className={css.priceWrapper}>{`${parseThousandNumber(
                price.amount,
              )}đ ${unit ? `/ ${unit}` : ''}`}</div>
              <RenderWhen condition={foodApprovalActiveTab !== 'draft'}>
                <div>
                  <Badge
                    type={getApprovalStateType(adminApproval)}
                    label={getLabelByKey(
                      FOOD_APPROVAL_STATE_OPTIONS,
                      adminApproval,
                    )}
                  />
                </div>
              </RenderWhen>
            </div>
          </div>
          <div className={css.bottomWrapper}>
            <RenderWhen condition={!!foodType}>
              <div className={css.foodType}>
                <Badge
                  type={EBadgeType.success}
                  label={getLabelByKey(FOOD_TYPE_OPTIONS, foodType)}
                />
              </div>
            </RenderWhen>
          </div>
        </div>
      </div>
    </div>
  );

  const handleRemoveFood = () => {
    actionController.setFalse();
    setFoodToRemove({ id: foodId, title: foodName });
  };

  const handleActionsBtnClick = () => {
    if (isMobileLayout) {
      setSelectedFood(food);
      openManipulateFoodModal();
    } else {
      actionController.setTrue();
    }
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

  useEffect(() => {
    if (!editableFoodMap[foodId]) {
      dispatch(partnerFoodSliceThunks.fetchEditableFood(foodId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [foodId, dispatch, JSON.stringify(editableFoodMap)]);

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
        svgClassName={css.checkboxSvg}
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
      <RenderWhen
        condition={foodApprovalActiveTab === EFoodApprovalState.DECLINED}>
        <InlineTextButton
          className={css.reApprovalBtn}
          onClick={onReApprovalFood}>
          Duyệt lại
        </InlineTextButton>
      </RenderWhen>
      <div className={css.actionsWrapper} onClick={handleActionsBtnClick}>
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
