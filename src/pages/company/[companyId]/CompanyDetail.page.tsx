import { useEffect } from 'react';
import { useRouter } from 'next/router';

import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  addWorkspaceCompanyId,
  companyThunks,
} from '@redux/slices/company.slice';

const CompanyDetailPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isCompanyNotFound = useAppSelector(
    (state) => state.company.isCompanyNotFound,
  );
  const { companyId } = router.query;
  const { isReady } = router;
  useEffect(() => {
    if (isReady) dispatch(addWorkspaceCompanyId(companyId));
  }, [companyId, dispatch, isReady]);

  useEffect(() => {
    if (isReady) dispatch(companyThunks.companyInfo());
  }, [isReady]);

  if (isCompanyNotFound) {
    return <div>Khong tim thay cong ty nay, xin vui long thu lai.</div>;
  }

  return <div>Thong tin tai khoan</div>;
};

export default CompanyDetailPage;
