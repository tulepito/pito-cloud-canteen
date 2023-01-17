import {
  addWorkspaceCompanyId,
  BookerManageCompany,
} from '@redux/slices/company.slice';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { useAppDispatch } from './reduxHooks';

const useFetchCompanyInfo = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { companyId = '' } = router.query;

  useEffect(() => {
    const fetchData = async () => {
      dispatch(addWorkspaceCompanyId(companyId));
      await dispatch(BookerManageCompany.companyInfo());
    };
    fetchData();
  }, [companyId, dispatch]);
};

export default useFetchCompanyInfo;
