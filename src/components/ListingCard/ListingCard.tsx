import { useRef } from 'react';
import classNames from 'classnames';

import Badge from '@components/Badge/Badge';
import IconCheckmarkWithCircle from '@components/Icons/IconCheckmark/IconCheckmarkWithCircle';
import IconPlusDish from '@components/Icons/IconPlusDish/IconPlusDish';
import ResponsiveImage from '@components/ResponsiveImage/ResponsiveImage';
import { useAppDispatch } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { shoppingCartThunks } from '@redux/slices/shoppingCart.slice';
import { EImageVariants, SPECIAL_DIET_OPTIONS } from '@src/utils/enums';
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
};

const ListingCard: React.FC<TListCardProps> = ({
  className,
  listing,
  planId,
  dayId,
  isSelected,
  selectDisabled,
}) => {
  const detailModalController = useBoolean();
  const requirementRef = useRef<string | undefined>();

  const requirement = requirementRef.current;
  const mealId = listing?.id?.uuid;
  const { title, description } = Listing(listing).getAttributes();
  const { specialDiets = [], allergicIngredients = [] } =
    Listing(listing).getPublicData();
  const listingImage = Listing(listing).getImages()[0];
  const dispatch = useAppDispatch();

  const handleAddToCard = () => {
    if (!selectDisabled) {
      dispatch(
        shoppingCartThunks.addToCart({ planId, dayId, mealId, requirement }),
      );
    }
  };
  const handleRemoveFromCard = () => {
    dispatch(shoppingCartThunks.removeFromCart({ planId, dayId }));
  };

  const badges = specialDiets
    .slice(0, 3)
    .map((diet: string) =>
      SPECIAL_DIET_OPTIONS.find((item) => item.key === diet),
    );

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
      <div>
        <div className={css.listingImage} onClick={viewListingDetail}>
          <ResponsiveImage
            image={listingImage}
            alt={title}
            variants={[EImageVariants.landscapeCrop]}
          />
        </div>
        <div className={css.listingCardContent}>
          <div className={css.listingCardInfo} onClick={viewListingDetail}>
            <h6 className={css.title}>{title}</h6>
            <div className={css.categories}>
              {badges.map((badge: any) => (
                <Badge
                  key={badge?.key}
                  label={badge?.label}
                  type={badge?.badgeType}
                />
              ))}
            </div>
            <p className={css.description}>{description}</p>
          </div>
          <div className={css.listingCardFooter}>
            <p className={css.allergiesLabel}>
              {allergicIngredients
                .map((item: string) => `Có ${item}`)
                .join(', ')}
            </p>
            {isSelected ? (
              <span className={css.removeDish} onClick={handleRemoveFromCard}>
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
      </div>
      <ListingDetailModal
        listing={listing}
        isOpen={detailModalController.value}
        title={title}
        onClose={handleCloseListingDetailModal}
        onChangeRequirement={handleChangeRequirement}
        onSelectFood={handleSelectFoodInModal}
      />
    </div>
  );
};

export default ListingCard;
