import { useMemo } from 'react';

import IconClose from '@components/Icons/IconClose/IconClose';
import Modal from '@components/Modal/Modal';
import ResponsiveImage from '@components/ResponsiveImage/ResponsiveImage';
import { calculateDistance } from '@helpers/mapHelpers';
import KeywordSearchForm from '@pages/admin/partner/components/KeywordSearchForm/KeywordSearchForm';
import FoodListSection from '@pages/company/booker/orders/draft/[orderId]/restaurants/components/ResultDetailModal/FoodListSection';
import ResultDetailHeader from '@pages/company/booker/orders/draft/[orderId]/restaurants/components/ResultDetailModal/ResultDetailHeader';
import TopContent from '@pages/company/booker/orders/draft/[orderId]/restaurants/components/ResultDetailModal/TopContent';
import { getListingImageById } from '@pages/company/booker/orders/draft/[orderId]/restaurants/helpers';
import { Listing } from '@utils/data';
import { EImageVariants } from '@utils/enums';
import type { TListing } from '@utils/types';

import css from './RestaurantModal.module.scss';

type TRestaurantModalProps = {
  isOpen?: boolean;
  onClose?: () => void;
  currentRestaurant: TListing;
  companyGeoOrigin: {
    lat: number;
    lng: number;
  };
  restaurantFoodList: {
    [restaurantId: string]: TListing[];
  };
  onSearchFoodName: (foodName: string, restaurantId: string) => void;
};

const RestaurantModal: React.FC<TRestaurantModalProps> = (props) => {
  const {
    isOpen = false,
    onClose = () => null,
    currentRestaurant,
    companyGeoOrigin,
    restaurantFoodList,
    onSearchFoodName,
  } = props;
  const restaurantId = Listing(currentRestaurant).getId();
  const restaurantName = Listing(currentRestaurant!).getAttributes().title;
  const { totalRating = 0, totalRatingNumber = 0 } = Listing(
    currentRestaurant!,
  ).getMetadata();
  const {
    avatarImageId,
    coverImageId,
    minQuantity = 0,
  } = Listing(currentRestaurant!).getPublicData();
  const restaurantAvatar = getListingImageById(
    avatarImageId,
    Listing(currentRestaurant!).getImages(),
  );
  const restaurantCover = getListingImageById(
    coverImageId,
    Listing(currentRestaurant!).getImages(),
  );
  const foodList = restaurantFoodList[restaurantId] || [];
  const { geolocation: restaurantOrigin } = Listing(
    currentRestaurant!,
  ).getAttributes();
  const distance = useMemo(
    () =>
      restaurantOrigin
        ? calculateDistance(companyGeoOrigin, restaurantOrigin)
        : '0',
    [companyGeoOrigin, restaurantOrigin],
  );
  const onSearchFormSubmit = (values: any) => {
    onSearchFoodName(values?.keywords, restaurantId!);
  };

  return (
    <Modal
      id="RestaurantModal"
      isOpen={isOpen}
      handleClose={onClose}
      scrollLayerClassName={css.scrollLayer}
      containerClassName={css.modalContainer}
      contentClassName={css.modalContent}
      customHeader={
        <div className={css.modalHeader}>
          <IconClose className={css.iconClose} onClick={onClose} />
        </div>
      }>
      <ResultDetailHeader restaurant={currentRestaurant} hideBadge />
      <div className={css.contentScroll}>
        <div className={css.content}>
          <div className={css.coverImage}>
            <ResponsiveImage
              alt={restaurantName}
              image={restaurantCover}
              variants={[EImageVariants.landscapeCrop]}
            />
          </div>
          <TopContent
            avatar={restaurantAvatar}
            restaurantName={restaurantName}
            ratingNumber={totalRating}
            rating={`${totalRating} (${totalRatingNumber})`}
            distance={`${distance}km`}
            minQuantity={minQuantity}
          />
          <div className={css.searchFormWrapper}>
            <KeywordSearchForm
              onSubmit={onSearchFormSubmit}
              inputClassName={css.searchInput}
            />
          </div>
          <FoodListSection foodList={foodList} hideSelection />
        </div>
      </div>
    </Modal>
  );
};

export default RestaurantModal;
