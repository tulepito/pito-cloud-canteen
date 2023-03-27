import { useEffect } from 'react';

import { useAppDispatch } from '@hooks/reduxHooks';
import { companyThunks } from '@redux/slices/company.slice';

const PersonalAccountPage = () => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(companyThunks.adminQueryCompanies({}));
  }, [dispatch]);

  return <div></div>;
};

export default PersonalAccountPage;
