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
import { FOOD_TYPE_OPTIONS, getLabelByKey } from '@src/utils/options';
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
  const storedRequirement =
    orders?.[userId]?.[planId]?.[parseInt(dayId, 10)]?.requirement;

  const requirement = requirementRef.current;
  const mealId = listing?.id?.uuid;
  const { title, description } = Listing(listing).getAttributes();
  const { allergicIngredients = [], foodType } =
    Listing(listing).getPublicData();
  const listingImage = Listing(listing).getImages()[0];
  const dispatch = useAppDispatch();

  const handleAddToCard = () => {
    if (!selectDisabled) {
      dispatch(
        shoppingCartThunks.addToCart({ planId, dayId, mealId, requirement }),
      );
      onAddedToCart?.({
        foodName: title,
        timestamp: dayId,
      });
    }
  };
  const handleRemoveFromCard = () => {
    if (isOrderAlreadyStarted) return;
    dispatch(shoppingCartThunks.removeFromCart({ planId, dayId }));
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
    dispatch(
      shoppingCartThunks.addToCart({ planId, dayId, mealId, requirement }),
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
      <div className={css.listingCardContent}>
        <div className={css.listingCardInfo} onClick={viewListingDetail}>
          <h6 className={css.title}>{title}</h6>
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
          {isSelected ? (
            <span
              className={classNames(css.removeDish, css.flip)}
              onClick={handleRemoveFromCard}>
              <IconCheckmarkWithCircle />
            </span>
          ) : (
            <span
              className={classNames(css.addDish, {
                [css.selectDisabled]: selectDisabled,
              })}
              onClick={handleAddToCard}>
              <IconPlusDish />
            </span>
          )}
        </div>
      </div>
      <ListingDetailModal
        listing={listing}
        isOpen={detailModalController.value}
        title={title}
        onClose={handleCloseListingDetailModal}
        onChangeRequirement={handleChangeRequirement}
        requirement={storedRequirement}
        onSelectFood={handleSelectFoodInModal}
      />
    </div>
  );
};

export default ListingCard;
