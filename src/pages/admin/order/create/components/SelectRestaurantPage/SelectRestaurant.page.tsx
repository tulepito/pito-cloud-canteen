import Badge from '@components/Badge/Badge';
import Pagination from '@components/Pagination/Pagination';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { selectRestaurantPageThunks } from '@redux/slices/SelectRestaurantPage.slice';
import { useEffect } from 'react';

import SelectFoodModal from '../SelectFoodModal/SelectFoodModal';
import RestaurantTable from './components/RestaurantTable/RestaurantTable';
import SearchRestaurantForm from './components/SearchRestaurantForm/SearchRestaurantForm';
import css from './SelectRestaurantPage.module.scss';

const SelectRestaurantPage = () => {
  const { value: isModalOpen, setValue: setModalOpen } = useBoolean();
  const dispatch = useAppDispatch();
  const { restaurants, pagination, foodList, fetchFoodPending } =
    useAppSelector((state) => state.SelectRestaurantPage);

  const {
    totalItems: total,
    page: current,
    perPage: pageSize = 100,
  } = pagination || {};
  const paginationProps = { total, defaultCurrent: current, pageSize };

  const handlePageChange = (page: number) => {
    const params = {
      page,
    };
    dispatch(selectRestaurantPageThunks.getRestaurants(params));
  };

  useEffect(() => {
    dispatch(selectRestaurantPageThunks.getRestaurants());
  }, [dispatch]);

  const handleRestaurantClick = (restaurantId: string) => () => {
    setModalOpen(true);

    dispatch(selectRestaurantPageThunks.getRestaurantFood(restaurantId));
  };

  return (
    <section>
      <div className={css.titleContainer}>
        <h1>Danh sach nha hang</h1>
        <Badge
          label={
            'Cho ngày 15/02/2022 - Thứ 3 (16:00) - tại 111 Trần Huy Liệu, P8, Q.Phú Nhuận, HCM  '
          }
        />
      </div>
      <SearchRestaurantForm onSubmit={() => {}} />
      <RestaurantTable
        restaurants={restaurants}
        onItemClick={handleRestaurantClick}
      />
      <div className={css.paginationContainer}>
        <Pagination {...paginationProps} onChange={handlePageChange} />
      </div>
      <SelectFoodModal
        items={foodList}
        isOpen={isModalOpen && !fetchFoodPending}
        handleClose={() => setModalOpen(false)}
      />
    </section>
  );
};

export default SelectRestaurantPage;
