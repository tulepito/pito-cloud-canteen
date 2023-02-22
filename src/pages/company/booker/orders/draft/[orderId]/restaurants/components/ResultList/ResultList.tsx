import RestaurantCard from '@components/RestaurantCard/RestaurantCard';
import { useAppDispatch } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import type { TListing } from '@utils/types';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';

import { BookerDraftOrderPageThunks } from '../../../BookerDraftOrderPage.slice';
import ResultDetailModal from '../ResultDetailModal/ResultDetailModal';
import EmptyList from './EmptyList';
import css from './ResultList.module.scss';

type TResultListProps = {
  className?: string;
  restaurants?: any[];
  isLoading?: boolean;
  companyGeoOrigin: {
    lat: number;
    lng: number;
  };
  totalRatings: any[];
  timestamp: number;
  restaurantFood: {
    [restaurantId: string]: TListing[];
  };
};

const ResultList: React.FC<TResultListProps> = ({
  className,
  restaurants = [],
  isLoading,
  companyGeoOrigin,
  totalRatings,
  timestamp,
  restaurantFood,
}) => {
  const router = useRouter();
  const { restaurantId, orderId, menuId } = router.query;

  const [selectedRestaurantId, setSelectedRestaurantId] = useState<
    string | undefined
  >(`${restaurantId}`);
  const detailModal = useBoolean(!!restaurantId);

  const dispatch = useAppDispatch();

  const onRestaurantClick = (id: string) => () => {
    detailModal.setTrue();
    setSelectedRestaurantId(id);
    dispatch(
      BookerDraftOrderPageThunks.fetchFoodListFromRestaurant({
        restaurantId: id,
        timestamp,
      }),
    );
  };

  useEffect(() => {
    if (detailModal.value && restaurantId) {
      dispatch(
        BookerDraftOrderPageThunks.fetchFoodListFromRestaurant({
          restaurantId: `${restaurantId}`,
          menuId: `${menuId}`,
          timestamp,
        }),
      );
    }
  }, [restaurantId, menuId, detailModal.value]);

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
              onClick={onRestaurantClick(restaurant?.id.uuid)}
              key={restaurant?.id.uuid}
              className={css.card}
              restaurant={restaurant}
              companyGeoOrigin={companyGeoOrigin}
              totalRatings={totalRatings}
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
        totalRatings={totalRatings}
      />
    </>
  );
};

export default ResultList;
