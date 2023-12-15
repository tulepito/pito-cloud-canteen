import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import classNames from 'classnames';
import { DateTime } from 'luxon';

import Button from '@components/Button/Button';
import IconCricleStar from '@components/Icons/IconCricleStar/IconCricleStar';
import IconFilter from '@components/Icons/IconFilter/IconFilter';
import IconRatingFace from '@components/Icons/IconRatingFace/IconRatingFace';
import IconReviewEmpty from '@components/Icons/IconReviewEmpty/IconReviewEmpty';
import IconUser from '@components/Icons/IconUser/IconUser';

import css from './ManageReviews.module.scss';

type TReviewContent = {
  id: number;
  name: string;
  rating: number;
  foodRating: number;
  eatingUtensilRating: number;
  description: string;
  foodName: string;
  orderDate: DateTime;
  avatar: string;
};

const ManageReviewsPage = () => {
  const intl = useIntl();

  const calculateRatingPercent = (rating: number) => {
    return `${(rating / 5) * 100}%`;
  };

  const food = 4.2;
  const packaging = 4.2;
  const reviewsData: TReviewContent[] = [
    {
      id: 1,
      name: 'vy',
      rating: 3,
      foodName: 'Hàu nướng phô mai',
      foodRating: 3,
      description:
        'Lorem ipsum dolor sit amet consectetur. Sagittis auctor sit vulputate pulvinar proin at ut amet.',
      eatingUtensilRating: 3,
      orderDate: DateTime.now(),
      avatar: 'avatar',
    },
  ];

  return (
    <div className={css.root}>
      <div className={css.headerPage}>
        {intl.formatMessage({ id: 'PartnerSidebar.reviews' })}
      </div>
      <div className={classNames(css.overviewClass, css.titleText)}>
        {intl.formatMessage({ id: 'ManagePartnerReviewsPage.overView' })}
      </div>
      <div className={css.summarizeContainer}>
        <div
          className={classNames(
            css.summarizeItemContainer,
            css.summarizeValueContainer,
          )}>
          <div className={css.summarizeLable}>
            <IconUser variant="multiUser" />
            <span className={css.normalText}>Tổng đánh giá</span>
          </div>
          <div className={css.summarizeValue}>800</div>
        </div>
        <div
          className={classNames(
            css.summarizeItemContainer,
            css.summarizeValueContainer,
          )}>
          <div className={css.summarizeLable}>
            <IconCricleStar />
            <span>Điểm tổng</span>
          </div>
          <div className={css.summarizeValue}>4.8</div>
        </div>
        <div
          className={classNames(
            css.summarizeItemContainer,
            css.detailRatingContainer,
          )}>
          <div className={css.detailRatingRow}>
            <span className={classNames(css.scenarioLabel, css.rattingText)}>
              Món ăn:
            </span>
            <div className={css.ratingBar}>
              <div
                style={{ width: calculateRatingPercent(food || 0) }}
                className={css.activeBar}></div>
            </div>
            <span className={classNames(css.ratingPoint, css.rattingText)}>{`${
              food || 0
            }/5`}</span>
          </div>
          <div className={css.detailRatingRow}>
            <span className={classNames(css.scenarioLabel, css.rattingText)}>
              Dụng cụ:
            </span>
            <div className={css.ratingBar}>
              <div
                style={{
                  width: calculateRatingPercent(packaging || 0),
                }}
                className={css.activeBar}></div>
            </div>
            <span className={classNames(css.ratingPoint, css.rattingText)}>{`${
              packaging || 0
            }/5`}</span>
          </div>
        </div>
      </div>
      <div className={css.reviewTable}>
        <div className={css.tableTitleContainer}>
          <span className={css.titleText}>Đánh giá chi tiết</span>
          <Button
            type="button"
            variant="secondary"
            className={css.filterButton}>
            <IconFilter className={css.filterIcon} />
            <FormattedMessage id="IntegrationFilterModal.filterMessage" />
          </Button>
        </div>

        {reviewsData.length === 0 ? (
          <div className={css.dataEmtpy}>
            <IconReviewEmpty />
            <span className={classNames(css.dataEmptyTitle, css.normalText)}>
              Bạn chưa có đánh giá chi tiết nào
            </span>
          </div>
        ) : (
          reviewsData.map((r) => {
            return (
              <div key={r.id} className={css.reviewCardContainer}>
                <div className={css.reviewCardContainerAvartar}>
                  <IconRatingFace className={css.avatar} rating={5} />
                </div>
                <div className={css.reviewCardContainerItem}>
                  <div className={css.nameRatingContainer}>
                    <span
                      className={classNames(css.nameValue, css.foodNameText)}>
                      {r.name}
                    </span>
                    <span
                      className={classNames(css.ratingValue, css.rattingText)}>
                      {intl.formatMessage({
                        id: `FieldRating.label.${r.rating}`,
                      })}
                    </span>
                  </div>
                  <div className={css.foodRatingContainer}>
                    <div className={css.foodRatingContainerItem}>
                      <IconRatingFace
                        className={css.iconRatingFace}
                        rating={r.foodRating}
                      />
                      <span className={css.foodRatingContainerItemLabel}>
                        Thức ăn:
                      </span>
                      <span className={css.foodRatingContainerItemValue}>
                        {intl.formatMessage({
                          id: `FieldRating.label.${r.foodRating}`,
                        })}
                      </span>
                    </div>
                    <div className={css.foodRatingContainerItem}>
                      <IconRatingFace
                        className={css.iconRatingFace}
                        rating={r.eatingUtensilRating}
                      />{' '}
                      <span
                        className={classNames(
                          css.foodRatingContainerItemLabel,
                          css.normalText,
                        )}>
                        Dụng cụ:
                      </span>
                      <span
                        className={classNames(
                          css.foodRatingContainerItemValue,
                          css.normalText,
                        )}>
                        {intl.formatMessage({
                          id: `FieldRating.label.${r.eatingUtensilRating}`,
                        })}
                      </span>
                    </div>
                  </div>
                  <span className={css.normalText}>{r.description}</span>
                  <div>
                    <span
                      className={classNames(
                        css.nameText,
                        css.foodTitleAndDate,
                      )}>
                      Đã đặt món:
                    </span>
                    <span className={classNames(css.foodNameText)}>
                      {` ${r.foodName} • `}
                    </span>

                    <span
                      className={classNames(
                        css.nameText,
                        css.foodTitleAndDate,
                      )}>
                      {r.orderDate.toString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ManageReviewsPage;
