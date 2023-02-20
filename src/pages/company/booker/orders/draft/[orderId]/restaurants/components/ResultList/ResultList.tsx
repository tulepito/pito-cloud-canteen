import RestaurantCard from '@components/RestaurantCard/RestaurantCard';
import { useAppDispatch } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { BookerDraftOrderPageThunks } from '@redux/slices/BookerDraftOrderPage.slice';
import type { TListing } from '@utils/types';
import classNames from 'classnames';
import React, { useState } from 'react';
import Skeleton from 'react-loading-skeleton';

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
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<
    string | undefined
  >();
  const detailModal = useBoolean(false);
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
        onClose={detailModal.setFalse}
        restaurantFood={restaurantFood}
        selectedRestaurantId={selectedRestaurantId}
      />
    </>
  );
};

export default ResultList;
