import Button from '@components/Button/Button';
import IconClose from '@components/Icons/IconClose/IconClose';
import Modal from '@components/Modal/Modal';
import ResponsiveImage from '@components/ResponsiveImage/ResponsiveImage';
import { calculateDistance } from '@helpers/mapHelpers';
import useBoolean from '@hooks/useBoolean';
import { Listing } from '@utils/data';
import { EImageVariants } from '@utils/enums';
import type { TListing } from '@utils/types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';

import { getListingImageById } from '../../helpers';
import FoodDetailModal from '../FoodDetailModal/FoodDetailModal';
import FoodListSection from './FoodListSection';
import ResultDetailFilters from './ResultDetailFilters';
import ResultDetailHeader from './ResultDetailHeader';
import css from './ResultDetailModal.module.scss';
import TopContent from './TopContent';

type TResultDetailModalProps = {
  isOpen?: boolean;
  onClose?: () => void;
  onClickFood?: () => void;
  selectedRestaurantId?: string;
  restaurantFood: {
    [restaurantId: string]: TListing[];
  };
  restaurants: TListing[];
  companyGeoOrigin: {
    lat: number;
    lng: number;
  };
  totalRatings: any[];
};

const ResultDetailModal: React.FC<TResultDetailModalProps> = ({
  isOpen = false,
  onClose = () => null,
  restaurantFood,
  selectedRestaurantId,
  restaurants,
  companyGeoOrigin,
  totalRatings,
}) => {
  const intl = useIntl();
  const [selectedFoods, setSelectedFoods] = useState<string[]>([]);
  const foodModal = useBoolean(false);
  const [selectedFood, setSelectedFood] = useState<TListing | null>(null);

  const currentRestaurant = useMemo(
    () =>
      restaurants.find(
        (restaurant) => restaurant.id?.uuid === selectedRestaurantId,
      ) || null,
    [restaurants, selectedRestaurantId],
  );
  const { geolocation: restaurantOrigin } = Listing(
    currentRestaurant!,
  ).getAttributes();

  const { rating = 0 } = Listing(currentRestaurant!).getMetadata();
  const restaurantName = Listing(currentRestaurant!).getAttributes().title;
  const { avatarImageId, coverImageId } = Listing(
    currentRestaurant!,
  ).getPublicData();
  const restaurantAvatar = getListingImageById(
    avatarImageId,
    Listing(currentRestaurant!).getImages(),
  );
  const restaurantCover = getListingImageById(
    coverImageId,
    Listing(currentRestaurant!).getImages(),
  );
  const totalReviewsOfRestaurant = useMemo(
    () =>
      totalRatings.find(
        (_restaurant) => _restaurant.restaurantId === selectedRestaurantId,
      )?.totalReviews || 0,
    [totalRatings, selectedRestaurantId],
  );

  const distance = useMemo(
    () =>
      restaurantOrigin
        ? calculateDistance(companyGeoOrigin, restaurantOrigin)
        : '0',
    [companyGeoOrigin, restaurantOrigin],
  );

  const originFoodIdList = useMemo(() => {
    return (restaurantFood?.[selectedRestaurantId!] || []).map(
      (item) => item?.id?.uuid,
    );
  }, [restaurantFood, selectedRestaurantId]);

  const handleSelecFood = useCallback(
    (foodId: string) => {
      setSelectedFoods([...selectedFoods, foodId]);
    },
    [selectedFoods],
  );

  const handleRemoveFood = useCallback(
    (foodId: string) => {
      setSelectedFoods(selectedFoods.filter((id) => id !== foodId));
    },
    [selectedFoods],
  );

  const handleSelectFoods = useCallback((foodIds: string[]) => {
    setSelectedFoods([...foodIds]);
  }, []);

  const onClickFood = (foodId: string) => {
    foodModal.setTrue();
    setSelectedFood(
      restaurantFood[selectedRestaurantId!].find(
        (food) => food.id?.uuid === foodId,
      ) || null,
    );
  };

  useEffect(() => {
    if (!isOpen) {
      setSelectedFoods([]);
    }
  }, [isOpen]);

  const foodList = restaurantFood?.[selectedRestaurantId!];
  return (
    <>
      <Modal
        id="ResultDetailModal"
        scrollLayerClassName={css.scrollLayer}
        containerClassName={css.modalContainer}
        isOpen={isOpen}
        handleClose={onClose}
        customHeader={
          <div className={css.modalHeader}>
            <IconClose className={css.iconClose} onClick={onClose} />
          </div>
        }>
        <ResultDetailHeader
          restaurant={currentRestaurant!}
          numberSelectedDish={selectedFoods.length}
        />
        <div className={css.contentScroll}>
          <div className={css.content}>
            <div className={css.coverImage}>
              <ResponsiveImage
                alt={restaurantName}
                image={restaurantCover}
                variants={[
                  EImageVariants.default,
                  EImageVariants.landscapeCrop,
                ]}
              />
            </div>
            <TopContent
              avatar={restaurantAvatar}
              restaurantName={restaurantName}
              rating={`${rating} (${totalReviewsOfRestaurant})`}
              distance={`${distance}km`}
            />
            <ResultDetailFilters
              onSelectAllFood={handleSelectFoods}
              selectedFoodIds={selectedFoods}
              originFoodIdList={originFoodIdList}
            />
            <FoodListSection
              foodList={foodList}
              onSelectFood={handleSelecFood}
              onRemoveFood={handleRemoveFood}
              onClickFood={onClickFood}
              selectedFoodIds={selectedFoods}
            />
          </div>
        </div>
        <div className={css.footer}>
          <Button className={css.submitBtn}>
            {intl.formatMessage(
              {
                id: 'booker.orders.draft.resultDetailModal.addRestaurant',
              },
              {
                numberDish: selectedFoods.length,
              },
            )}
          </Button>
        </div>
      </Modal>
      <FoodDetailModal
        isOpen={foodModal.value}
        food={selectedFood!}
        onClose={foodModal.setFalse}
      />
    </>
  );
};

export default ResultDetailModal;
