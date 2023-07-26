/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useRouter } from 'next/router';

import Button from '@components/Button/Button';
import IconClose from '@components/Icons/IconClose/IconClose';
import IconSpinner from '@components/Icons/IconSpinner/IconSpinner';
import Modal from '@components/Modal/Modal';
import ResponsiveImage from '@components/ResponsiveImage/ResponsiveImage';
import { calculateDistance } from '@helpers/mapHelpers';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { orderAsyncActions } from '@redux/slices/Order.slice';
import { Listing } from '@utils/data';
import { EImageVariants, EOrderType } from '@utils/enums';
import type { TListing } from '@utils/types';

import { BookerSelectRestaurantThunks } from '../../BookerSelectRestaurant.slice';
import { getListingImageById } from '../../helpers';
import { useGetPlanDetails } from '../../hooks/orderData';
import { useGetRestaurant } from '../../hooks/restaurants';
import FoodDetailModal from '../FoodDetailModal/FoodDetailModal';
import RestaurantReviewModal from '../RestaurantReviewModal/RestaurantReviewModal';

import FoodListSection from './FoodListSection';
import ResultDetailFilters from './ResultDetailFilters';
import ResultDetailHeader from './ResultDetailHeader';
import TopContent from './TopContent';

import css from './ResultDetailModal.module.scss';

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
  fetchFoodInProgress: boolean;
  openFromCalendar?: boolean;
  timestamp?: number;
  onSearchSubmit?: (value: string, restaurantId: string) => void;
};

const ResultDetailModal: React.FC<TResultDetailModalProps> = ({
  isOpen = false,
  onClose = () => null,
  restaurantFood,
  selectedRestaurantId,
  restaurants,
  companyGeoOrigin,
  onSearchSubmit,
  fetchFoodInProgress,
  openFromCalendar,
  timestamp: propTimestamp,
}) => {
  const intl = useIntl();
  const router = useRouter();
  const { timestamp } = router.query;

  const [selectedFoods, setSelectedFoods] = useState<string[]>([]);
  const foodModal = useBoolean(false);
  const [selectedFood, setSelectedFood] = useState<TListing | null>(null);

  const { restaurant: preselectedRestaurant } = useGetRestaurant();

  const { orderId, planId, planDetail, orderType } = useGetPlanDetails();
  const { orderDetail } = Listing(planDetail).getMetadata();
  const restaurantReviewModalControl = useBoolean();
  const initFoodList = useMemo(() => {
    const detail =
      orderDetail?.[`${openFromCalendar ? propTimestamp : timestamp}`];
    const savedRestaurantId = detail?.restaurant?.id;

    if (selectedRestaurantId === savedRestaurantId) {
      const foodListObj = detail?.restaurant?.foodList || {};

      return Object.keys(foodListObj) || [];
    }

    return [];
  }, [planDetail, timestamp, isOpen, propTimestamp]);

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
      preselectedRestaurant ||
      restaurants.find(
        (restaurant) => restaurant.id?.uuid === selectedRestaurantId,
      ) ||
      null,
    [restaurants, selectedRestaurantId, JSON.stringify(preselectedRestaurant)],
  );

  const isNormalOrder = orderType === EOrderType.normal;

  const { geolocation: restaurantOrigin } = Listing(
    currentRestaurant!,
  ).getAttributes();
  const { totalRating = 0, totalRatingNumber = 0 } = Listing(
    currentRestaurant!,
  ).getMetadata();
  const restaurantName = Listing(currentRestaurant!).getAttributes().title;
  const {
    avatarImageId,
    coverImageId,
    minQuantity = 0,
    maxQuantity = Number.MAX_VALUE,
    phoneNumber,
  } = Listing(currentRestaurant!).getPublicData();
  const restaurantAvatar = getListingImageById(
    avatarImageId,
    Listing(currentRestaurant!).getImages(),
  );
  const restaurantCover = getListingImageById(
    coverImageId,
    Listing(currentRestaurant!).getImages(),
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

  const submitFoodListDisabled = selectedFoods.length === 0;

  // Method
  const dispatch = useAppDispatch();

  const handleSelectFood = useCallback(
    (foodId: string) => {
      setSelectedFoods([...selectedFoods, foodId]);
      if (foodModal.value) {
        foodModal.setFalse();
      }
    },
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

    const updateFoodList = selectedFoods.reduce((acc: any, foodId: string) => {
      const food = foodList?.find((item) => item.id?.uuid === foodId);
      if (food) {
        const foodListingGetter = Listing(food).getAttributes();

        acc[foodId] = {
          foodName: foodListingGetter.title,
          foodPrice: foodListingGetter.price?.amount || 0,
          foodUnit: foodListingGetter.publicData?.unit || '',
        };
      }

      return acc;
    }, {});

    const updateLineItems = isNormalOrder
      ? Object.entries<{
          foodName: string;
          foodPrice: number;
        }>(updateFoodList).map(([foodId, { foodName, foodPrice }]) => {
          return {
            id: foodId,
            name: foodName,
            unitPrice: foodPrice,
            price: foodPrice,
            quantity: 1,
          };
        })
      : [];

    const updatedValues = {
      [`${openFromCalendar ? propTimestamp : timestamp}`]: {
        restaurant: {
          ...orderDetail?.[`${openFromCalendar ? propTimestamp : timestamp}`]
            ?.restaurant,
          foodList: updateFoodList,
          id: selectedRestaurantId,
          restaurantName,
          menuId: currentMenuId,
          phoneNumber,
          minQuantity,
          maxQuantity,
        },
        lineItems: updateLineItems,
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

    if (!openFromCalendar) {
      onClose();
      router.push(`/company/booker/orders/draft/${orderId}`);
    } else {
      await dispatch(orderAsyncActions.fetchOrderDetail([planId]));
      onClose();
    }
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

  const onOpenReviewModal = useCallback(() => {
    restaurantReviewModalControl.setTrue();
  }, []);

  if (!isOpen) {
    return null;
  }

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
                className={css.restaurantCover}
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
              rating={`${totalRating} (${totalRatingNumber} đánh giá)`}
              ratingNumber={totalRating}
              distance={`${distance}km`}
              onOpenReviewModal={onOpenReviewModal}
            />
            <ResultDetailFilters
              onSelectAllFood={handleSelectFoods}
              selectedFoodIds={selectedFoods}
              originFoodIdList={originFoodIdList}
              onSearchSubmit={onCustomSearchSubmit}
            />
            <FoodListSection
              foodList={foodList}
              onSelectFood={handleSelectFood}
              onRemoveFood={handleRemoveFood}
              onClickFood={handleOpenFoodDetail}
              selectedFoodIds={selectedFoods}
              fetchFoodInProgress={fetchFoodInProgress}
            />
          </div>
        </div>
        <div className={css.footer}>
          <Button
            className={css.submitBtn}
            onClick={handleConfirmFoodList}
            disabled={submitFoodListDisabled}>
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
        onSelect={handleSelectFood}
      />
      <RestaurantReviewModal
        isOpen={restaurantReviewModalControl.value}
        onClose={restaurantReviewModalControl.setFalse}
      />
    </>
  );
};

export default ResultDetailModal;
