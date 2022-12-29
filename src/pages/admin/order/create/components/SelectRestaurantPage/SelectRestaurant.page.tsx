import Badge from '@components/Badge/Badge';
import Pagination from '@components/Pagination/Pagination';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { selectRestaurantPageThunks } from '@redux/slices/SelectRestaurantPage.slice';
import { useEffect } from 'react';

import RestaurantTable from '../RestaurantTable/RestaurantTable';
import SearchRestaurantForm from '../SearchRestaurantForm/SearchRestaurantForm';
import css from './SelectRestaurantPage.module.scss';

const SelectRestaurantPage = () => {
  const dispatch = useAppDispatch();
  const { restaurants } = useAppSelector((state) => state.SelectRestaurantPage);

  useEffect(() => {
    dispatch(selectRestaurantPageThunks.getRestaurants());
  }, [dispatch]);

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
      <RestaurantTable restaurants={restaurants} />
      <Pagination />
    </section>
  );
};

export default SelectRestaurantPage;
