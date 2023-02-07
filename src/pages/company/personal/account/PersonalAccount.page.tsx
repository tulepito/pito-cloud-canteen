import { useAppDispatch } from '@hooks/reduxHooks';
import { manageCompaniesThunks } from '@redux/slices/ManageCompaniesPage.slice';
import { useEffect } from 'react';

const PersonalAccountPage = () => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(manageCompaniesThunks.queryCompanies());
  }, [dispatch]);
  return <div></div>;
};

export default PersonalAccountPage;
