import { useEffect } from 'react';
import { useRouter } from 'next/router';

import {
  addWorkspaceCompanyId,
  companyThunks,
} from '@redux/slices/company.slice';

import { useAppDispatch, useAppSelector } from './reduxHooks';

const useFetchCompanyInfo = () => {
  const { query, isReady } = useRouter();
  const dispatch = useAppDispatch();
  const currentWorkspaceCompanyId = useAppSelector(
    (state) => state.company.workspaceCompanyId,
  );
  const { companyId = '' } = query;

  useEffect(() => {
    if (
      isReady &&
      companyId !== '' &&
      companyId !== 'personal' &&
      companyId !== currentWorkspaceCompanyId
    ) {
      (async () => {
        dispatch(addWorkspaceCompanyId(companyId));
        await dispatch(companyThunks.companyInfo());
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, currentWorkspaceCompanyId, isReady]);
};

export default useFetchCompanyInfo;
