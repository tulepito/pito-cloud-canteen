/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import Skeleton from 'react-loading-skeleton';
import { shallowEqual } from 'react-redux';
import { useRouter } from 'next/router';

import RestaurantCard from '@components/RestaurantCard/RestaurantCard';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { FavoriteThunks } from '@redux/slices/Favorite.slice';
import { QuizThunks } from '@redux/slices/Quiz.slice';
import { quizPaths } from '@src/paths';
import { User } from '@utils/data';
import type { TUser } from '@utils/types';

import EmptyList from '../../../draft/[orderId]/restaurants/components/ResultList/EmptyList';
import QuizModal from '../components/QuizModal/QuizModal';

import css from './QuizRestaurants.module.scss';

const QuizRestaurants = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isLoading = false;
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('');
  const restaurants = useAppSelector(
    (state) => state.Quiz.restaurants,
    shallowEqual,
  );
  const selectedCompany = useAppSelector((state) => state.Quiz.selectedCompany);

  const favoriteRestaurantInProgress = useAppSelector(
    (state) => state.Favorite.favoriteRestaurantInProgress,
  );

  const companyId = useMemo(
    () => User(selectedCompany as TUser).getId(),
    [JSON.stringify(selectedCompany)],
  );

  const companyGeoOrigin = useMemo(
    () => ({
      ...User(selectedCompany as TUser).getPublicData()?.location?.origin,
    }),
    [JSON.stringify(selectedCompany)],
  );

  const { favoriteRestaurantList } = User(
    selectedCompany as TUser,
  ).getPublicData();

  useEffect(() => {
    dispatch(QuizThunks.fetchRestaurants());
  }, [dispatch]);

  const onFavoriteRestaurant = async (restaurantId: string) => {
    setSelectedRestaurant(restaurantId);
    await dispatch(
      FavoriteThunks.favoriteRestaurant({
        companyId,
        restaurantId,
      }),
    );
  };

  const onSubmitClick = () => {
    router.push(quizPaths.MealDates);
  };

  const goBack = () => {
    router.back();
  };

  return (
    <QuizModal
      id="QuizRestaurantsModal"
      isOpen
      handleClose={() => {}}
      modalTitle={intl.formatMessage({
        id: 'QuizRestaurants.title',
      })}
      submitText="Tiếp tục"
      cancelText="Bỏ qua"
      onCancel={onSubmitClick}
      onSubmit={onSubmitClick}
      modalContainerClassName={css.modalContainer}
      onBack={goBack}>
      <div className={css.container}>
        {isLoading && (
          <div className={css.loadingList}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Skeleton key={item} className={css.loadingCard} />
            ))}
          </div>
        )}
        {!isLoading && restaurants.length === 0 && <EmptyList />}
        {!isLoading &&
          restaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant?.id.uuid}
              className={css.card}
              restaurant={restaurant}
              companyGeoOrigin={companyGeoOrigin}
              hideFavoriteIcon
              favoriteFunc={onFavoriteRestaurant}
              favoriteInProgress={
                favoriteRestaurantInProgress &&
                selectedRestaurant === restaurant?.id.uuid
              }
              alreadyFavorite={favoriteRestaurantList?.includes(
                restaurant?.id.uuid,
              )}
            />
          ))}
      </div>
    </QuizModal>
  );
};

export default QuizRestaurants;
