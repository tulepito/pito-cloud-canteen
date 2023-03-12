import { useEffect } from 'react';

import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';

import { BookerNewOrderThunks } from '../BookerNewOrder.slice';

const useLoadCompanies = () => {
  const dispatch = useAppDispatch();
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

  const currentUserId = currentUser?.id?.uuid;

  useEffect(() => {
    if (currentUserId) {
      dispatch(BookerNewOrderThunks.queryMyCompanies());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  return { myCompanies, queryInprogress, queryError };
};

export default useLoadCompanies;
