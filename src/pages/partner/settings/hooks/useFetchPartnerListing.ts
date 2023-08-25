import { useEffect } from 'react';

import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { currentUserSelector } from '@redux/slices/user.slice';

import { PartnerSettingsThunks } from '../PartnerSettings.slice';

export const useFetchPartnerListing = () => {
  const currentUser = useAppSelector(currentUserSelector);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (currentUser === null) return;

    dispatch(PartnerSettingsThunks.loadData());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(currentUser)]);
};
