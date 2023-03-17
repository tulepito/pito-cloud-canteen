import { useEffect } from 'react';

import { useAppDispatch } from '@hooks/reduxHooks';
import { manageCompaniesThunks } from '@redux/slices/ManageCompaniesPage.slice';

const PersonalAccountPage = () => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(manageCompaniesThunks.queryCompanies());
  }, [dispatch]);

  return <div></div>;
};

export default PersonalAccountPage;
