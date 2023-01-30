import Badge, { EBadgeType } from '@components/Badge/Badge';
import IconCheckmarkWithCircle from '@components/Icons/IconCheckmark/IconCheckmarkWithCircle';
import IconPlusDish from '@components/Icons/IconPlusDish/IconPlusDish';
import { useAppDispatch } from '@hooks/reduxHooks';
import { shoppingCartThunks } from '@redux/slices/shopingCart.slice';
import { LISTING } from '@utils/data';
import classNames from 'classnames';
import Image from 'next/image';

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
  const mealId = listing?.id?.uuid;
  const { title, description } = LISTING(listing).getAttributes();
  const dispatch = useAppDispatch();

  const handleAddToCard = () => {
    if (!selectDisabled) {
      dispatch(shoppingCartThunks.addToCart({ planId, dayId, mealId }));
    }
  };

  const classes = classNames(css.root, className);
  return (
    <div className={classes}>
      <div className={css.listingImage}>
        <Image
          alt="Listing Card "
          src={
            'https://res.cloudinary.com/eventors/image/upload/f_auto/v1584529827/eventors/hero-back_lbofw9.png'
          }
          fill={true}
        />
      </div>
      <div className={css.listingCardContent}>
        <div className={css.listingCardInfo}>
          <h6 className={css.title}>{title}</h6>
          <div className={css.categories}>
            <Badge label="Keto" type={EBadgeType.PROCESSING} />
          </div>
          <p className={css.description}>{description}</p>
        </div>
        <div className={css.listingCardFooter}>
          <p className={css.allergiesLabel}>Có hải sản</p>
          {isSelected ? (
            <span className={css.removeDish}>
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
  );
};

export default ListingCard;
