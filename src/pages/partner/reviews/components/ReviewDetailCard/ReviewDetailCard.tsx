import { useIntl } from 'react-intl';
import classNames from 'classnames';

import IconRatingFace from '@components/Icons/IconRatingFace/IconRatingFace';
import type { TReviewDetail } from '@src/types/partnerReviews';
import { formatDate } from '@src/utils/dates';

import css from './ReviewDetailCard.module.scss';

type TReviewDetailCardProps = {
  data: TReviewDetail;
  rootClassName?: string;
};

const ReviewDetailCard: React.FC<TReviewDetailCardProps> = ({
  data,
  rootClassName,
}) => {
  const intl = useIntl();
  const createdAt =
    typeof data.createdAt === 'string'
      ? new Date(data.createdAt)
      : data.createdAt;

  return (
    <div className={classNames(css.reviewCardContainer, rootClassName)}>
      <div className={css.reviewCardContainerAvartar}>
        <IconRatingFace className={css.avatar} rating={5} />
      </div>
      <div className={css.reviewCardContainerItem}>
        <div className={css.nameRatingContainer}>
          <span className={classNames(css.nameValue, css.foodNameText)}>
            {data.name}
          </span>
          <span className={classNames(css.ratingValue, css.ratingText)}>
            {intl.formatMessage({
              id: `FieldRating.label.${data.rating}`,
            })}
          </span>
        </div>
        <div className={css.foodRatingContainer}>
          <div className={css.foodRatingContainerItem}>
            <IconRatingFace
              className={css.iconRatingFace}
              rating={data.foodRating}
            />
            <span
              className={classNames(
                css.foodRatingContainerItemLabel,
                css.normalText,
              )}>
              {intl.formatMessage({
                id: 'ManagePartnerReviewsPage.foodLabel',
              })}
              :
            </span>
            <span
              className={classNames(
                css.foodRatingContainerItemValue,
                css.normalText,
              )}>
              {intl.formatMessage({
                id: `FieldRating.label.${data.foodRating}`,
              })}
            </span>
          </div>
          <div className={css.foodRatingContainerItem}>
            <IconRatingFace
              className={css.iconRatingFace}
              rating={data.packagingRating}
            />{' '}
            <span
              className={classNames(
                css.foodRatingContainerItemLabel,
                css.normalText,
              )}>
              {intl.formatMessage({
                id: 'ManagePartnerReviewsPage.packageTitle',
              })}
              :
            </span>
            <span
              className={classNames(
                css.foodRatingContainerItemValue,
                css.normalText,
              )}>
              {intl.formatMessage({
                id: `FieldRating.label.${data.packagingRating}`,
              })}
            </span>
          </div>
        </div>
        <span className={css.normalText}>{data.description}</span>
        <div>
          <span className={classNames(css.nameText, css.orderedFoodInfo)}>
            {intl.formatMessage({
              id: 'ManagePartnerReviewsPage.orderedFood',
            })}
            :
          </span>
          <span className={classNames(css.foodNameText, css.orderedFoodInfo)}>
            {` ${data.foodName} • `}
          </span>

          <span className={classNames(css.nameText, css.orderedFoodInfo)}>
            {formatDate(createdAt, 'dd/MM/yyyy')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ReviewDetailCard;
