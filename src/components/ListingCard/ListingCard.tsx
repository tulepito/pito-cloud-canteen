import { useRef } from 'react';
import classNames from 'classnames';

import Badge, { EBadgeType } from '@components/Badge/Badge';
import IconCheckmarkWithCircle from '@components/Icons/IconCheckmark/IconCheckmarkWithCircle';
import IconPlusDish from '@components/Icons/IconPlusDish/IconPlusDish';
import ResponsiveImage from '@components/ResponsiveImage/ResponsiveImage';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { shoppingCartThunks } from '@redux/slices/shoppingCart.slice';
import { EImageVariants } from '@src/utils/enums';
import { getLabelByKey, useFoodTypeOptionsByLocale } from '@src/utils/options';
import { CurrentUser, Listing } from '@utils/data';

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
  const requirementRef = useRef<string | undefined>();
  const orders = useAppSelector((state) => state.shoppingCart.orders);
  const currentUser = useAppSelector((state) => state.user.currentUser);

  const userId = CurrentUser(currentUser!).getId();
  const cartItem = orders?.[userId]?.[planId]?.[parseInt(dayId, 10)] || {};
  const storedRequirement = cartItem.requirement;
  const storedSecondRequirement = cartItem.secondaryRequirement;

  const FOOD_TYPE_OPTIONS = useFoodTypeOptionsByLocale();
  const requirement = requirementRef.current;
  const mealId = listing?.id?.uuid;
  const { title, description } = Listing(listing).getAttributes();
  const { allergicIngredients = [], foodType } =
    Listing(listing).getPublicData();
  const listingImage = Listing(listing).getImages()[0];
  const dispatch = useAppDispatch();

  // Kiểm tra trạng thái chọn món
  const isFirstFoodSelected = cartItem.foodId === mealId;
  const isSecondFoodSelected = cartItem.secondaryFoodId === mealId;
  const hasFirstFood = !!cartItem.foodId && cartItem.foodId !== 'notJoined';
  const hasSecondFood = !!cartItem.secondaryFoodId;
  const isFoodSelected = isFirstFoodSelected || isSecondFoodSelected;

  const canAddAsSecondFood =
    hasFirstFood && !hasSecondFood && isFirstFoodSelected;
  const canAddSecondFood = hasFirstFood && !hasSecondFood;
  const isAddDisabled = hasSecondFood || selectDisabled;

  const handleAddToCard = () => {
    if (isAddDisabled) {
      return;
    }

    const isSecondFood = hasFirstFood;

    dispatch(
      shoppingCartThunks.addToCart({
        planId,
        dayId,
        mealId,
        requirement,
        isSecondFood,
      }),
    );
    onAddedToCart?.({
      foodName: title,
      timestamp: dayId,
    });
  };

  const handleRemoveFromCard = () => {
    if (isOrderAlreadyStarted) return;

    if (isSecondFoodSelected) {
      dispatch(
        shoppingCartThunks.removeFromCart({
          planId,
          dayId,
          removeSecondFood: true,
        }),
      );
    } else {
      dispatch(shoppingCartThunks.removeFromCart({ planId, dayId }));
    }
  };

  const classes = classNames(css.root, className);

  const viewListingDetail = () => {
    detailModalController.setTrue();
  };

  const handleCloseListingDetailModal = () => {
    detailModalController.setFalse();
  };

  const handleChangeRequirement = (value: string) => {
    requirementRef.current = value;
  };

  const handleSelectFoodInModal = () => {
    const isSecondFood = hasFirstFood && !isFirstFoodSelected;
    dispatch(
      shoppingCartThunks.addToCart({
        planId,
        dayId,
        mealId,
        requirement,
        isSecondFood,
      }),
    );
    detailModalController.setFalse();
  };

  return (
    <div className={classes}>
      <div className={css.listingImage} onClick={viewListingDetail}>
        <ResponsiveImage
          image={listingImage}
          alt={title}
          variants={[EImageVariants.landscapeCrop]}
          emptyType="food"
        />
      </div>
      <div
        className={classNames(
          css.listingCardContent,
          'transition-all duration-200',
        )}>
        <div className={css.listingCardInfo} onClick={viewListingDetail}>
          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-2 mb-1">
            <h6 className={css.title}>{title}</h6>
            <div className="flex items-center justify-start">
              {isFirstFoodSelected && (
                <Badge
                  className="flex-shrink-0 text-[11px] px-2 py-0.5 rounded-xl"
                  label="Món 1"
                  type={EBadgeType.success}
                />
              )}
              {isSecondFoodSelected && (
                <Badge
                  className="flex-shrink-0 text-[11px] px-2 py-0.5 rounded-xl"
                  label="Món 2"
                  type={EBadgeType.success}
                />
              )}
            </div>
          </div>
          <div className={css.categories} style={{ marginTop: '8px' }}>
            <Badge
              className={css.badge}
              label={getLabelByKey(FOOD_TYPE_OPTIONS, foodType)}
              type={EBadgeType.success}
            />
          </div>
          <p className={css.description}>{description}</p>
        </div>
        <div className={css.listingCardFooter}>
          <p className={css.allergiesLabel}>
            {allergicIngredients.map((item: string) => `Có ${item}`).join(', ')}
          </p>
          <div className="flex items-center gap-2">
            {/* Hiển thị checkmark nếu món đã được chọn */}
            {(isFoodSelected || isSelected) && (
              <span
                className={classNames(css.removeDish, css.flip)}
                onClick={handleRemoveFromCard}
                title={
                  isSecondFoodSelected
                    ? 'Xóa món thứ 2'
                    : isFirstFoodSelected && hasSecondFood
                    ? 'Xóa món 1 (món 2 sẽ tự động thành món 1)'
                    : 'Xóa món'
                }>
                <IconCheckmarkWithCircle className="items-center" />
              </span>
            )}
            {canAddAsSecondFood && (
              <span
                className={classNames(css.addDish, 'ml-auto')}
                onClick={handleAddToCard}
                title="Thêm món này lần nữa (x2 định lượng)">
                <IconPlusDish />
              </span>
            )}
            {!isFoodSelected && !isSelected && canAddSecondFood && (
              <span
                className={classNames(css.addDish)}
                onClick={handleAddToCard}
                title="Thêm món thứ 2 (tùy chọn)">
                <IconPlusDish />
              </span>
            )}
            {!isFoodSelected &&
              !isSelected &&
              !canAddSecondFood &&
              !isAddDisabled && (
                <span
                  className={classNames(css.addDish)}
                  onClick={handleAddToCard}
                  title="Thêm món">
                  <IconPlusDish />
                </span>
              )}
            {!isFoodSelected &&
              !isSelected &&
              isAddDisabled &&
              !canAddSecondFood && (
                <span
                  className={classNames(css.addDish, css.selectDisabled)}
                  title="Đã chọn đủ 2 món">
                  <IconPlusDish />
                </span>
              )}
          </div>
        </div>
      </div>
      <ListingDetailModal
        listing={listing}
        isOpen={detailModalController.value}
        title={title}
        onClose={handleCloseListingDetailModal}
        onChangeRequirement={handleChangeRequirement}
        requirement={
          isSecondFoodSelected
            ? storedSecondRequirement || ''
            : storedRequirement || ''
        }
        onSelectFood={handleSelectFoodInModal}
      />
    </div>
  );
};

export default ListingCard;
