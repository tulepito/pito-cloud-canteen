import Button from '@components/Button/Button';
import IconClose from '@components/Icons/IconClose/IconClose';
import IconSpinner from '@components/Icons/IconSpinner/IconSpinner';
import Modal from '@components/Modal/Modal';
import ResponsiveImage from '@components/ResponsiveImage/ResponsiveImage';
import { calculateDistance } from '@helpers/mapHelpers';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { Listing } from '@utils/data';
import { EImageVariants } from '@utils/enums';
import type { TListing } from '@utils/types';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';

import { BookerSelectRestaurantThunks } from '../../BookerSelectRestaurant.slice';
import { getListingImageById } from '../../helpers';
import { useGetPlanDetails } from '../../hooks/orderData';
import FoodDetailModal from '../FoodDetailModal/FoodDetailModal';
import FoodListSection from './FoodListSection';
import ResultDetailFilters from './ResultDetailFilters';
import ResultDetailHeader from './ResultDetailHeader';
import css from './ResultDetailModal.module.scss';
import TopContent from './TopContent';

type TResultDetailModalProps = {
  isOpen?: boolean;
  onClose?: () => void;
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
  fetchFoodInProgress: boolean;
  onSearchSubmit?: (value: string, restaurantId: string) => void;
};

const ResultDetailModal: React.FC<TResultDetailModalProps> = ({
  isOpen = false,
  onClose = () => null,
  restaurantFood,
  selectedRestaurantId,
  restaurants,
  companyGeoOrigin,
  totalRatings,
  onSearchSubmit,
  fetchFoodInProgress,
}) => {
  const intl = useIntl();

  const router = useRouter();
  const { timestamp } = router.query;

  const [selectedFoods, setSelectedFoods] = useState<string[]>([]);
  const foodModal = useBoolean(false);
  const [selectedFood, setSelectedFood] = useState<TListing | null>(null);

  const { orderId, planId, planDetail } = useGetPlanDetails();
  const initFoodList = useMemo(() => {
    const detail =
      Listing(planDetail).getMetadata().orderDetail?.[`${timestamp}`];
    const savedRestaurantId = detail?.restaurant?.id;
    if (selectedRestaurantId === savedRestaurantId) {
      const foodListObj = detail?.restaurant?.foodList || {};
      return Object.keys(foodListObj) || [];
    }
    return [];
  }, [planDetail, timestamp, isOpen]);

  useEffect(() => {
    setSelectedFoods(initFoodList);
  }, [initFoodList]);

  const updatePlanDetailInProgress = useAppSelector(
    (state) => state.BookerSelectRestaurant.updatePlanDetailInProgress,
  );
  const currentMenuId = useAppSelector(
    (state) => state.BookerSelectRestaurant.currentMenuId,
  );

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

  const foodList = restaurantFood?.[selectedRestaurantId!];

  // Method
  const dispatch = useAppDispatch();

  const handleSelecFood = useCallback(
    (foodId: string) => {
      setSelectedFoods([...selectedFoods, foodId]);
      if (foodModal.value) {
        foodModal.setFalse();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedFoods, foodModal.value],
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

  const handleOpenFoodDetail = (foodId: string) => {
    foodModal.setTrue();
    setSelectedFood(
      restaurantFood[selectedRestaurantId!].find(
        (food) => food.id?.uuid === foodId,
      ) || null,
    );
  };

  const handleConfirmFoodList = async () => {
    if (updatePlanDetailInProgress) {
      return;
    }

    const updatedFoodList = selectedFoods.reduce((acc: any, foodId: string) => {
      const food = foodList?.find((item) => item.id?.uuid === foodId);
      if (food) {
        acc[foodId] = {
          foodName: Listing(food).getAttributes().title,
          foodPrice: Listing(food).getAttributes().price?.amount,
        };
      }
      return acc;
    }, {});

    const updatedValues = {
      [`${timestamp}`]: {
        restaurant: {
          foodList: updatedFoodList,
          id: selectedRestaurantId,
          restaurantName,
          menuId: currentMenuId,
        },
      },
    };
    await dispatch(
      BookerSelectRestaurantThunks.updatePlanDetail({
        orderId,
        planId,
        orderDetail: updatedValues,
        updateMode: 'merge',
      }),
    );
    router.push(`/company/booker/orders/draft/${orderId}`);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      setSelectedFoods([]);
    }
  }, [isOpen]);

  const onCustomSearchSubmit = useCallback(
    (keyword: string) => {
      onSearchSubmit?.(keyword, selectedRestaurantId!);
    },
    [onSearchSubmit, selectedRestaurantId],
  );

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
              ratingNumber={rating}
              distance={`${distance}km`}
            />
            <ResultDetailFilters
              onSelectAllFood={handleSelectFoods}
              selectedFoodIds={selectedFoods}
              originFoodIdList={originFoodIdList}
              onSearchSubmit={onCustomSearchSubmit}
            />
            <FoodListSection
              foodList={foodList}
              onSelectFood={handleSelecFood}
              onRemoveFood={handleRemoveFood}
              onClickFood={handleOpenFoodDetail}
              selectedFoodIds={selectedFoods}
              fetchFoodInProgress={fetchFoodInProgress}
            />
          </div>
        </div>
        <div className={css.footer}>
          <Button className={css.submitBtn} onClick={handleConfirmFoodList}>
            <span>
              {intl.formatMessage(
                {
                  id: 'booker.orders.draft.resultDetailModal.addRestaurant',
                },
                {
                  numberDish: selectedFoods.length,
                },
              )}
            </span>
            {updatePlanDetailInProgress && (
              <IconSpinner className={css.spinner} />
            )}
          </Button>
        </div>
      </Modal>
      <FoodDetailModal
        isOpen={foodModal.value}
        food={selectedFood!}
        onClose={foodModal.setFalse}
        onSelect={handleSelecFood}
      />
    </>
  );
};

export default ResultDetailModal;
