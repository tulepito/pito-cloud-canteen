import { useAppDispatch } from '@hooks/reduxHooks';
import { manageCompaniesThunks } from '@redux/slices/ManageCompaniesPage.slice';
import { useEffect } from 'react';

const CompanyDashboardPage = () => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(manageCompaniesThunks.queryCompanies());
  }, [dispatch]);

  return <div>Company dashboard</div>;
};

export default CompanyDashboardPage;
