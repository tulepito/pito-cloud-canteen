import RestaurantCard from '@components/RestaurantCard/RestaurantCard';
import classNames from 'classnames';
import React from 'react';
import Skeleton from 'react-loading-skeleton';

import EmptyList from './EmptyList';
import css from './ResultList.module.scss';

type TResultListProps = {
  className?: string;
  restaurants?: any[];
};

const ResultList: React.FC<TResultListProps> = ({
  className,
  restaurants = [],
}) => {
  const classes = classNames(css.root, className);
  const isLoading = false;

  return (
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
          <RestaurantCard key={restaurant?.id} className={css.card} />
        ))}
    </div>
  );
};

export default ResultList;
