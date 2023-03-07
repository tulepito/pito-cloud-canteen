import { useEffect } from 'react';

import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';

import { BookerNewOrderThunks } from '../BookerNewOrder.slice';

const useLoadCompanies = () => {
  const currentUser = useAppSelector((state) => state.user.currentUser);
  const myCompanies = useAppSelector(
    (state) => state.BookerNewOrderPage.myCompanies,
  );
  const queryInprogress = useAppSelector(
    (state) => state.BookerNewOrderPage.queryInprogress,
  );
  const queryError = useAppSelector(
    (state) => state.BookerNewOrderPage.queryError,
  );

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (currentUser?.id?.uuid) {
      dispatch(BookerNewOrderThunks.queryMyCompanies());
    }
  }, [currentUser?.id?.uuid]);

  return { myCompanies, queryInprogress, queryError };
};

export default useLoadCompanies;
