/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';
import { toast } from 'react-toastify';
import isEmpty from 'lodash/isEmpty';
import { useRouter } from 'next/router';

import IconArrow from '@components/Icons/IconArrow/IconArrow';
import MobileTopContainer from '@components/MobileTopContainer/MobileTopContainer';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { useViewport } from '@hooks/useViewport';
import { resetImage } from '@redux/slices/uploadImage.slice';
import { enGeneralPaths } from '@src/paths';
import type { OrderListing } from '@src/types';
import { EOrderStates } from '@src/utils/enums';

import OrderRatingForm from '../components/OrderRatingForm/OrderRatingForm';

import { OrderRatingThunks } from './OrderRating.slice';

import css from './OrderRating.module.scss';

const OrderRatingPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const { isMobileLayout } = useViewport();
  const { orderId } = router.query;
  const currentUser = useAppSelector(
    (state) => state.user.currentUser,
    shallowEqual,
  );
  const currentUserId = currentUser?.id.uuid;

  const orderListing: OrderListing | undefined = useAppSelector(
    (state) => state.OrderRating.order,
    shallowEqual,
  );
  const fetchOrderInProgress = useAppSelector(
    (state) => state.OrderRating.fetchOrderInProgress,
    shallowEqual,
  );
  const restaurantsByDay = useAppSelector(
    (state) => state.OrderRating.restaurantsByDay,
    shallowEqual,
  );
  const images = useAppSelector(
    (state) => state.uploadImage.images,
    shallowEqual,
  );

  const postRatingInProgress = useAppSelector(
    (state) => state.OrderRating.postRatingInProgress,
  );

  const {
    orderState,
    ratings: orderRatings,
    companyName,
  } = orderListing?.attributes?.metadata || {};

  const isOrderRatedByBooker =
    orderState === EOrderStates.reviewed ||
    !!(orderRatings || []).find(
      (rating) => rating?.reviewerId === currentUserId,
    );

  const pageTitle = intl.formatMessage(
    {
      id: 'OrderRatingPage.pageTitle',
    },
    {
      orderTitle: orderListing?.attributes?.title,
    },
  );

  useEffect(() => {
    if (isOrderRatedByBooker && !fetchOrderInProgress) {
      router.push(
        enGeneralPaths.company.orders['[orderId]'].index(String(orderId)),
      );
    }
  }, [isOrderRatedByBooker, fetchOrderInProgress]);

  useEffect(() => {
    if (orderId) {
      dispatch(OrderRatingThunks.fetchOrder(orderId as string));
    }
  }, [orderId]);

  useEffect(() => {
    dispatch(resetImage());
  }, []);

  const onSubmit = async (values: any) => {
    const { general, staff, food, packaging, service, detailTextRating } =
      values;
    const allRatingValues = Object.keys(values);
    const isStaffSelected = allRatingValues.includes('staff');
    const isFoodSelected = allRatingValues.includes('food');
    const isPackagingSelected = allRatingValues.includes('packaging');
    const isServiceSelected = allRatingValues.includes('service');

    const isStaffSatifactedSelected = isStaffSelected && staff >= 3;
    const isFoodSatifactedSelected = isFoodSelected && food >= 3;
    const isPackagingSatifactedSelected = isPackagingSelected && packaging >= 3;
    const isServiceSatifactedSelected = isServiceSelected && service >= 3;

    const ratings = restaurantsByDay.map((restaurant) => {
      const { restaurantId, timestamp } = restaurant;
      const restaurantWithTimestamp = `${restaurantId} - ${timestamp}`;
      const rating = {
        orderId: orderId as string,
        restaurantId,
        timestamp,
        reviewerId: currentUserId,
        generalRating: +general,
        detailRating: {
          food: {
            rating: isFoodSelected ? +food : +general,
            optionalRating: [],
          },
          packaging: {
            rating: isPackagingSelected ? +packaging : +general,
            optionalRating: [],
          },
        },
      };
      if (food) {
        const selectedOptionalRestaurant =
          values?.['optionalFood-restaurant-satifacted'] ||
          values?.['optionalFood-restaurant-unsatifacted'];
        const selectedOptionalFoodRating = isFoodSatifactedSelected
          ? values?.['optionalFood-satifacted']
          : values?.['optionalFood-unsatifacted'];

        const belongedOptionalFoodRating =
          selectedOptionalFoodRating
            ?.filter((item: string) => item.startsWith(restaurantWithTimestamp))
            .map((item: string) => item.split(' - ')[2]) || [];

        const getFoodRatingCondition =
          (!selectedOptionalFoodRating && !selectedOptionalRestaurant) ||
          (selectedOptionalRestaurant &&
            selectedOptionalRestaurant === restaurantWithTimestamp) ||
          (selectedOptionalFoodRating && !isEmpty(belongedOptionalFoodRating));

        rating.detailRating.food = {
          rating: getFoodRatingCondition ? +food : +general,
          optionalRating: belongedOptionalFoodRating,
        };
      }

      if (packaging) {
        const selectedOptionalRestaurant =
          values?.['optionalPackaging-restaurant-satifacted'] ||
          values?.['optionalPackaging-restaurant-unsatifacted'];
        const selectedOptionalPackagingRating = isPackagingSatifactedSelected
          ? values?.['optionalPackaging-satifacted']
          : values?.['optionalPackaging-unsatifacted'];

        const belongedOptionalPackagingRating =
          selectedOptionalPackagingRating
            ?.filter((item: string) => item.startsWith(restaurantWithTimestamp))
            .map((item: string) => item.split(' - ')[2]) || [];

        const getPackagingRatingCondition =
          (!selectedOptionalRestaurant && !selectedOptionalPackagingRating) ||
          (selectedOptionalRestaurant &&
            selectedOptionalRestaurant === restaurantWithTimestamp) ||
          (selectedOptionalPackagingRating &&
            !isEmpty(belongedOptionalPackagingRating));

        rating.detailRating.packaging = {
          rating: getPackagingRatingCondition ? +packaging : +general,
          optionalRating: belongedOptionalPackagingRating,
          ...(values?.[
            `optionalPackaging-other - ${restaurantWithTimestamp}`
          ] && {
            optionalOtherReview:
              values?.[`optionalPackaging-other - ${restaurantWithTimestamp}`],
          }),
        };
      }

      return rating;
    });
    const staffRating = {
      rating: isStaffSelected ? +staff : +general,
      optionalRating: isStaffSelected
        ? isStaffSatifactedSelected
          ? values?.['optionalStaff-satifacted']
          : values?.['optionalStaff-unsatifacted']
        : [],
    };
    const serviceRating = {
      rating: isServiceSelected ? +service : +general,
      optionalRating: isServiceSelected
        ? isServiceSatifactedSelected
          ? values?.['optionalService-satifacted']
          : values?.['optionalService-unsatifacted']
        : [],
      ...(values?.['optionalService-other'] && {
        optionalOtherReview: values?.['optionalService-other'],
      }),
    };
    if (!isOrderRatedByBooker) {
      const { meta } = await dispatch(
        OrderRatingThunks.postRating({
          ratings,
          detailTextRating,
          staff: staffRating,
          service: serviceRating,
          companyName: companyName || '',
        }),
      );
      if (meta.requestStatus === 'fulfilled') {
        toast.success('Cảm ơn bạn đã đánh giá');
        router.replace(
          enGeneralPaths.company.orders['[orderId]'].index(String(orderId)),
        );
      }
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <>
      {isMobileLayout && (
        <MobileTopContainer
          className={css.mobileTopContainer}
          onGoBack={handleGoBack}
          hasGoBackButton
          title={intl.formatMessage({
            id: 'OrderRatingPage.mobilePageTitle',
          })}
        />
      )}
      <div className={css.root}>
        {!isMobileLayout && (
          <div className={css.header}>
            <div className={css.goBackBtn} onClick={handleGoBack}>
              <IconArrow direction="left" />
              {intl.formatMessage({
                id: 'NavigateButtons.goBack',
              })}
            </div>
            <div className={css.pageTitle}>{pageTitle}</div>
          </div>
        )}
        <div className={css.ratingContent}>
          <OrderRatingForm
            onSubmit={onSubmit}
            inProgress={postRatingInProgress}
            restaurantsByDay={restaurantsByDay}
            images={images}
            order={orderListing as any}
          />
        </div>
      </div>
    </>
  );
};

export default OrderRatingPage;
