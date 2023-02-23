import {
  addWorkspaceCompanyId,
  BookerManageCompany,
} from '@redux/slices/company.slice';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

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
        await dispatch(BookerManageCompany.companyInfo());
      })();
    }
  }, [companyId, currentWorkspaceCompanyId, dispatch, isReady]);
};

export default useFetchCompanyInfo;
