import { useEffect } from 'react';

import { useAppDispatch } from '@hooks/reduxHooks';
import { AdminAttributesThunks } from '@pages/admin/Attributes.slice';

import CreatePartnerPage from './CreatePartner.page';

export default function PartnerRoute() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(AdminAttributesThunks.fetchAttributes());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <CreatePartnerPage />;
}
