import { useEffect } from 'react';
import { useRouter } from 'next/router';

import { getCompanyIdFromBookerUser } from '@helpers/company';
import {
  addWorkspaceCompanyId,
  companyThunks,
} from '@redux/slices/company.slice';

import { useAppDispatch, useAppSelector } from './reduxHooks';

const useFetchCompanyInfoCurrentUser = () => {
  const { query, isReady } = useRouter();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.user.currentUser);
  const { companyId = '' } = query;

  useEffect(() => {
    if (isReady && companyId === 'personal') {
      (async () => {
        const currentUserCompany = getCompanyIdFromBookerUser(currentUser!);
        dispatch(addWorkspaceCompanyId(currentUserCompany));
        await dispatch(companyThunks.companyInfo());
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, currentUser, isReady]);
};

export default useFetchCompanyInfoCurrentUser;
