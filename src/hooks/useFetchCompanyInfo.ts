import {
  addWorkspaceCompanyId,
  BookerManageCompany,
} from '@redux/slices/company.slice';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { useAppDispatch } from './reduxHooks';

const useFetchCompanyInfo = () => {
  const { query, isReady } = useRouter();
  const dispatch = useAppDispatch();
  const { companyId = '' } = query;

  useEffect(() => {
    if (isReady && companyId !== '') {
      (async () => {
        dispatch(addWorkspaceCompanyId(companyId));
        await dispatch(BookerManageCompany.companyInfo());
      })();
    }
  }, [companyId, dispatch, isReady]);
};

export default useFetchCompanyInfo;
