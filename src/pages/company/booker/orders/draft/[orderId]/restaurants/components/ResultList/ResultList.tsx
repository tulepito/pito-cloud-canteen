/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { shallowEqual } from 'react-redux';
import classNames from 'classnames';
import { useRouter } from 'next/router';

import RestaurantCard from '@components/RestaurantCard/RestaurantCard';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { Listing, User } from '@utils/data';
import type { TListing, TUser } from '@utils/types';

import {
  BookerSelectRestaurantActions,
  BookerSelectRestaurantThunks,
} from '../../BookerSelectRestaurant.slice';
import ResultDetailModal from '../ResultDetailModal/ResultDetailModal';

import EmptyList from './EmptyList';

import css from './ResultList.module.scss';

type TResultListProps = {
  className?: string;
  restaurants?: any[];
  isLoading?: boolean;
  companyAccount: TUser | null;
  order?: TListing | null;
};

const ResultList: React.FC<TResultListProps> = ({
  className,
  restaurants = [],
  isLoading,
  companyAccount,
  order,
}) => {
  const router = useRouter();
  const { timestamp: queryTs, restaurantId, orderId, menuId } = router.query;
  const timestamp = +`${queryTs}`;

  const orderListing = Listing(order!);
  const { packagePerMember = 0 } = orderListing.getMetadata();

  const [selectedRestaurantId, setSelectedRestaurantId] = useState<
    string | undefined
  >(`${restaurantId}`);
  const detailModal = useBoolean(!!restaurantId);

  const restaurantFood = useAppSelector(
    (state) => state.BookerSelectRestaurant.restaurantFood,
    shallowEqual,
  );
  const fetchRestaurantFoodInProgress = useAppSelector(
    (state) => state.BookerSelectRestaurant.fetchRestaurantFoodInProgress,
  );

  const companyGeoOrigin = useMemo(
    () => ({
      ...User(companyAccount as TUser).getPublicData().companyLocation?.origin,
    }),
    [companyAccount],
  );

  const dispatch = useAppDispatch();

  const onRestaurantClick = (id: string) => {
    detailModal.setTrue();
    setSelectedRestaurantId(id);
    dispatch(BookerSelectRestaurantActions.setSelectedRestaurantId(id));
    dispatch(
      BookerSelectRestaurantThunks.fetchFoodListFromRestaurant({
        restaurantId: id,
        timestamp,
      }),
    );
  };

  useEffect(() => {
    if (detailModal.value && restaurantId && order) {
      dispatch(
        BookerSelectRestaurantThunks.fetchFoodListFromRestaurant({
          restaurantId: `${restaurantId}`,
          menuId: `${menuId}`,
          timestamp,
        }),
      );
    }
  }, [restaurantId, menuId, detailModal.value, JSON.stringify(order)]);

  const handleCloseDetail = () => {
    if (restaurantId) {
      router.push({
        pathname: router.pathname,
        query: { orderId, timestamp },
      });
    } else {
      detailModal.setFalse();
    }
  };

  const onSearchSubmit = (keywords: string, _restaurantId: string) => {
    dispatch(
      BookerSelectRestaurantThunks.fetchFoodListFromRestaurant({
        keywords,
        restaurantId: selectedRestaurantId,
        menuId,
        timestamp,
      }),
    );
  };

  const classes = classNames(css.root, className);

  return (
    <>
      <div className={classes}>
        {isLoading && (
          <div className={css.loadingList}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((item) => (
              <Skeleton key={item} className={css.loadingCard} />
            ))}
          </div>
        )}
        {!isLoading && restaurants.length === 0 && <EmptyList />}
        {!isLoading &&
          restaurants.map((restaurant) => (
            <RestaurantCard
              onClick={onRestaurantClick}
              key={restaurant?.id.uuid}
              className={css.card}
              restaurant={restaurant}
              companyGeoOrigin={companyGeoOrigin}
            />
          ))}
      </div>
      <ResultDetailModal
        isOpen={detailModal.value}
        onClose={handleCloseDetail}
        restaurantFood={restaurantFood}
        selectedRestaurantId={selectedRestaurantId}
        restaurants={restaurants}
        companyGeoOrigin={companyGeoOrigin}
        onSearchSubmit={onSearchSubmit}
        fetchFoodInProgress={fetchRestaurantFoodInProgress}
        packagePerMember={packagePerMember}
      />
    </>
  );
};

export default ResultList;
