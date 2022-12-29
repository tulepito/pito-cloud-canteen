import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  addWorkspaceCompanyId,
  BookerManageCompany,
} from '@redux/slices/company.slice';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const CompanyDetailPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isCompanyNotFound = useAppSelector(
    (state) => state.company.isCompanyNotFound,
  );
  const { companyId } = router.query;
  useEffect(() => {
    dispatch(addWorkspaceCompanyId(companyId));
  }, [companyId, dispatch]);

  useEffect(() => {
    dispatch(BookerManageCompany.companyInfo());
  }, []);

  if (isCompanyNotFound) {
    return <div>Khong tim thay cong ty nay, xin vui long thu lai.</div>;
  }
  return <div>Thong tin tai khoan</div>;
};

export default CompanyDetailPage;
