import { useEffect } from 'react';

import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useAppDispatch } from '@hooks/reduxHooks';
import { useViewport } from '@hooks/useViewport';
import AccountNavigationModal from '@pages/company/components/AccountNavigationModal/AccountNavigationModal';
import { companyThunks } from '@redux/slices/company.slice';

const PersonalAccountPage = () => {
  const { isMobileLayout, isTabletLayout } = useViewport();
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(companyThunks.adminQueryCompanies({}));
  }, [dispatch]);

  return (
    <RenderWhen condition={isMobileLayout || isTabletLayout}>
      <AccountNavigationModal />
      <RenderWhen.False>
        <div></div>
      </RenderWhen.False>
    </RenderWhen>
  );
};

export default PersonalAccountPage;
