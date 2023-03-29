import { shallowEqual } from 'react-redux';

import { useAppSelector } from './reduxHooks';
import useBoolean from './useBoolean';

const useRestaurantDetailModal = () => {
  const detailModal = useBoolean();

  const restaurants = useAppSelector(
    (state) => state.BookerSelectRestaurant.searchResult,
    shallowEqual,
  );
  const menuId = useAppSelector(
    (state) => state.BookerSelectRestaurant.currentMenuId,
  );

  return {
    isRestaurantDetailModalOpen: detailModal.value,
    openRestaurantDetailModal: () => detailModal.setTrue(),
    closeRestaurantDetailModal: () => detailModal.setFalse(),
    restaurants,
    menuId,
  };
};

export default useRestaurantDetailModal;
