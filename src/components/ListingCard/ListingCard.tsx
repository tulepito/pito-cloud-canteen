import classNames from 'classnames';

import Badge, { EBadgeType } from '@components/Badge/Badge';
import IconCheckmarkWithCircle from '@components/Icons/IconCheckmark/IconCheckmarkWithCircle';
import IconPlusDish from '@components/Icons/IconPlusDish/IconPlusDish';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { useDualFoodSelection } from '@hooks/useDualFoodSelection';
import { useSingleFoodSelection } from '@hooks/useSingleFoodSelection';
import { getLabelByKey, useFoodTypeOptionsByLocale } from '@src/utils/options';
import { Listing } from '@utils/data';

import ListingDetailModal from './ListingDetailModal';

import css from './ListingCard.module.scss';

type TListCardProps = {
  className?: string;
  listing: any;
  planId: string;
  dayId: string;
  isSelected?: boolean;
  selectDisabled?: boolean;
  isOrderAlreadyStarted: boolean;
  onAddedToCart?: ({
    foodName,
    timestamp,
  }: {
    foodName?: string;
    timestamp: string;
  }) => void;
};

const ListingCard: React.FC<TListCardProps> = ({
  className,
  listing,
  planId,
  dayId,
  isSelected,
  selectDisabled,
  isOrderAlreadyStarted,
  onAddedToCart,
}) => {
  const detailModalController = useBoolean();
  const isAllowAddSecondaryFood = useAppSelector(
    (state) => state.ParticipantPlanPage.isAllowAddSecondaryFood,
  );

  const plan = useAppSelector((state) => state.ParticipantPlanPage.plan);
  const planData = plan?.[dayId];
  const foodList = planData?.foodList || [];

  const mealId = listing?.id?.uuid;
  const { title, description } = Listing(listing).getAttributes();
  const {
    allergicIngredients = [],
    foodType,
    numberOfMainDishes,
  } = Listing(listing).getPublicData();

  const FOOD_TYPE_OPTIONS = useFoodTypeOptionsByLocale();

  const singleFoodSelection = useSingleFoodSelection({
    mealId,
    planId,
    dayId,
    isSelected,
    selectDisabled,
    isOrderAlreadyStarted,
    mealTitle: title,
    onAddedToCart,
  });

  const dualFoodSelection = useDualFoodSelection({
    mealId,
    mealTitle: title,
    planId,
    dayId,
    isSelected,
    selectDisabled,
    isOrderAlreadyStarted,
    foodList,
    onAddedToCart,
  });

  const selection = isAllowAddSecondaryFood
    ? dualFoodSelection
    : singleFoodSelection;

  const classes = classNames(css.root, className);

  const viewListingDetail = () => {
    detailModalController.setTrue();
  };

  const handleCloseListingDetailModal = () => {
    detailModalController.setFalse();
  };

  const handleSelectFoodInModal = () => {
    if (
      isAllowAddSecondaryFood &&
      dualFoodSelection.isRestrictedForThisListing
    ) {
      detailModalController.setFalse();

      return;
    }

    selection.handleAddToCart();

    if (isAllowAddSecondaryFood) {
      detailModalController.setFalse();
    }
  };

  return (
    <div className={classes}>
      <div
        className={classNames(
          css.listingCardContent,
          'transition-all duration-200',
        )}>
        <div className={css.listingCardInfo} onClick={viewListingDetail}>
          <div className={classNames('items-center gap-2 mb-1 flex')}>
            <h6 className={classNames(css.title, 'flex-1')}>{title}</h6>
            <div className="flex items-center justify-start gap-2">
              <div className="flex items-center gap-2">
                {(selection.isFoodSelected || isSelected) && (
                  <span
                    className={classNames(css.removeDish, css.flip)}
                    onClick={(e) => {
                      e.stopPropagation();
                      selection.handleRemoveFromCart();
                    }}
                    title={selection.getRemoveDishTooltip()}>
                    <IconCheckmarkWithCircle className="items-center" />
                  </span>
                )}
                {isAllowAddSecondaryFood && (
                  <>
                    {dualFoodSelection.canShowAddAsSecondFood &&
                      !dualFoodSelection.isSecondaryAddDisabled && (
                        <span
                          className={classNames(
                            css.addDish,
                            'ml-auto',
                            dualFoodSelection.isSecondaryAddDisabled &&
                              css.selectDisabled,
                          )}
                          onClick={
                            dualFoodSelection.isSecondaryAddDisabled
                              ? undefined
                              : (e) => {
                                  e.stopPropagation();
                                  dualFoodSelection.handleAddToCart();
                                }
                          }
                          title={
                            dualFoodSelection.isSecondaryAddDisabled
                              ? 'Không thể chọn thêm món này'
                              : 'Thêm món này lần nữa (x2 định lượng)'
                          }>
                          <IconPlusDish />
                        </span>
                      )}
                    {dualFoodSelection.canShowAddSecondOption && (
                      <span
                        className={classNames(
                          css.addDish,
                          dualFoodSelection.isSecondaryAddDisabled &&
                            css.selectDisabled,
                        )}
                        onClick={
                          dualFoodSelection.isSecondaryAddDisabled
                            ? undefined
                            : (e) => {
                                e.stopPropagation();
                                dualFoodSelection.handleAddToCart();
                              }
                        }
                        title={
                          dualFoodSelection.isSecondaryAddDisabled
                            ? 'Không thể chọn thêm món thứ 2'
                            : 'Thêm món thứ 2 (tùy chọn)'
                        }>
                        <IconPlusDish />
                      </span>
                    )}
                    {dualFoodSelection.canShowPrimaryAdd && (
                      <span
                        className={classNames(
                          css.addDish,
                          dualFoodSelection.isPrimaryAddDisabled &&
                            css.selectDisabled,
                        )}
                        onClick={
                          dualFoodSelection.isPrimaryAddDisabled
                            ? undefined
                            : (e) => {
                                e.stopPropagation();
                                dualFoodSelection.handleAddToCart();
                              }
                        }
                        title={
                          dualFoodSelection.isPrimaryAddDisabled
                            ? 'Không thể chọn món này'
                            : 'Thêm món'
                        }>
                        <IconPlusDish />
                      </span>
                    )}
                  </>
                )}
                {/* Logic cho single food selection */}
                {!isAllowAddSecondaryFood &&
                  singleFoodSelection.canShowAddButton && (
                    <span
                      className={classNames(css.addDish)}
                      onClick={
                        singleFoodSelection.isAddDisabled
                          ? undefined
                          : (e) => {
                              e.stopPropagation();
                              singleFoodSelection.handleAddToCart();
                            }
                      }
                      title={
                        singleFoodSelection.isAddDisabled
                          ? 'Không thể chọn món này'
                          : 'Thêm món'
                      }>
                      <IconPlusDish />
                    </span>
                  )}
              </div>
            </div>
          </div>
          <div className={css.categories} style={{ marginTop: '8px' }}>
            <Badge
              className={css.badge}
              label={getLabelByKey(FOOD_TYPE_OPTIONS, foodType)}
              type={EBadgeType.success}
            />
            {numberOfMainDishes === 1 && isAllowAddSecondaryFood && (
              <Badge
                className={css.badge}
                label="Chọn 1 món"
                type={EBadgeType.info}
              />
            )}
          </div>
          <div className="flex items-center gap-2">
            {isAllowAddSecondaryFood &&
              dualFoodSelection.isFirstFoodSelected && (
                <Badge
                  className="flex-shrink-0 text-[11px] px-2 py-0.5 rounded-xl"
                  label="Món 1"
                  type={EBadgeType.success}
                />
              )}
            {isAllowAddSecondaryFood &&
              dualFoodSelection.isSecondFoodSelected && (
                <Badge
                  className="flex-shrink-0 text-[11px] px-2 py-0.5 rounded-xl"
                  label="Món 2"
                  type={EBadgeType.success}
                />
              )}
          </div>
          <p className={css.description}>{description}</p>
        </div>
        <RenderWhen condition={allergicIngredients.length > 0}>
          <div className={css.listingCardFooter}>
            <p className={css.allergiesLabel}>
              {allergicIngredients
                .map((item: string) => `Có ${item}`)
                .join(', ')}
            </p>
          </div>
        </RenderWhen>
      </div>
      <ListingDetailModal
        listing={listing}
        isOpen={detailModalController.value}
        title={title}
        onClose={handleCloseListingDetailModal}
        onChangeRequirement={selection.handleChangeRequirement}
        requirement={
          isAllowAddSecondaryFood
            ? dualFoodSelection.isSecondFoodSelected
              ? dualFoodSelection.storedSecondRequirement
              : dualFoodSelection.storedRequirement
            : singleFoodSelection.requirement || ''
        }
        onSelectFood={handleSelectFoodInModal}
      />
    </div>
  );
};

export default ListingCard;
