import { SearchFilterThunks } from '@redux/slices/SearchFilter.slice';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { useAppDispatch } from './reduxHooks';

const useFetchSearchFilters = () => {
  const dispatch = useAppDispatch();
  const { isReady } = useRouter();
  useEffect(() => {
    if (isReady) {
      (async () => {
        await dispatch(SearchFilterThunks.fetchSearchFilter());
      })();
    }
  }, [dispatch, isReady]);
};

export default useFetchSearchFilters;
