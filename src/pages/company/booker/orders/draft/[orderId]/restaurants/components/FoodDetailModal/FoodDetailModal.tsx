import React from 'react';
import { useIntl } from 'react-intl';
import Skeleton from 'react-loading-skeleton';

import Button from '@components/Button/Button';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import Modal from '@components/Modal/Modal';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import ResponsiveImage from '@components/ResponsiveImage/ResponsiveImage';
import SlideModal from '@components/SlideModal/SlideModal';
import { addCommas } from '@helpers/format';
import { FOOD_SIDE_DISH_OPTIONS } from '@src/utils/options';
import { Listing } from '@utils/data';
import { EImageVariants } from '@utils/enums';
import type { TListing } from '@utils/types';

import css from './FoodDetailModal.module.scss';

type TFoodDetailModalProps = {
  isOpen?: boolean;
  food?: TListing;
  onClose?: () => void;
  onSelect?: (foodId: string) => void;
  isLoading?: boolean;
  isMobileLayout?: boolean;
};

const FoodDetailModal: React.FC<TFoodDetailModalProps> = ({
  isOpen = false,
  food,
  onClose = () => null,
  onSelect,
  isLoading,
  isMobileLayout,
}) => {
  const intl = useIntl();

  const { sideDishes = [] } = Listing(food!).getPublicData();
  const renderedSideDishes = sideDishes?.map(
    (sideDish: string, index: number) => (
      <div className={css.sideDish} key={`${index}-${sideDish}`}>
        {
          FOOD_SIDE_DISH_OPTIONS.find((option) => option.key === sideDish)
            ?.label
        }
      </div>
    ),
  );
  const handleSelectFood = () => {
    onSelect?.(food?.id?.uuid);
  };

  if (!isOpen) {
    return null;
  }

  const ModalComponent = isMobileLayout ? SlideModal : Modal;

  return (
    <ModalComponent
      id="FoodDetailModal"
      scrollLayerClassName={css.scrollLayer}
      containerClassName={css.modalContainer}
      isOpen={isOpen}
      handleClose={onClose}
      onClose={onClose}
      customHeader={<div></div>}>
      <div className={css.header}>
        <span className={css.goBack} onClick={onClose}>
          <IconArrow className={css.iconBack} direction="left" />
          <span>
            {intl.formatMessage({
              id: 'booker.orders.draft.foodDetailModal.back',
            })}
          </span>
        </span>
      </div>
      <RenderWhen condition={!isLoading}>
        <div className={css.scrollContainer}>
          <div className={css.coverImage}>
            <ResponsiveImage
              alt={Listing(food!).getAttributes().title}
              image={Listing(food!).getImages()[0]}
              variants={[EImageVariants.default]}
            />
          </div>
          <div className={css.topContent}>
            <div className={css.foodTitle}>
              {Listing(food!).getAttributes().title}
            </div>
            <div className={css.price}>{`${addCommas(
              Listing(food!).getAttributes()?.price?.amount,
            )} ₫ / Phần`}</div>
          </div>
          <p className={css.description}>
            {Listing(food!).getAttributes().description || 'Không có mô tả'}
          </p>
          <div className={css.sideDishesWrapper}>
            <div className={css.sideDishesTitle}>
              {intl.formatMessage({
                id: 'booker.orders.draft.foodDetailModal.sideDishesTitle',
              })}
            </div>
            {renderedSideDishes}
          </div>
        </div>

        <RenderWhen.False>
          <Skeleton className={css.loading} />
          <Skeleton className={css.loadingTitle} />
          <Skeleton className={css.loadingContent} />
        </RenderWhen.False>
      </RenderWhen>
      {onSelect && (
        <div className={css.footer}>
          <Button className={css.submitBtn} onClick={handleSelectFood}>
            {intl.formatMessage({
              id: 'booker.orders.draft.foodDetailModal.addDish',
            })}
          </Button>
        </div>
      )}
    </ModalComponent>
  );
};

export default FoodDetailModal;
