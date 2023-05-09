import { useEffect } from 'react';

import MetaWrapper from '@components/MetaWrapper/MetaWrapper';
import { useAppDispatch } from '@hooks/reduxHooks';
import { AdminAttributesThunks } from '@pages/admin/Attributes.slice';

import EditPartnerPage from './edit/EditPartner.page';

export default function PartnerRoute() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(AdminAttributesThunks.fetchAttributes());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MetaWrapper routeName="AdminEditPartnerRoute">
      <EditPartnerPage />
    </MetaWrapper>
  );
}
