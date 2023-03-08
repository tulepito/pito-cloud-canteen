import { useEffect } from 'react';

import { useAppDispatch } from '@hooks/reduxHooks';
import { resetCompanySliceStates } from '@redux/slices/company.slice';

import EditCompanyWizard from '../components/EditCompanyWizard/EditCompanyWizard';

export default function CreateCompanyPage() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(resetCompanySliceStates());
  }, [dispatch]);
  return <EditCompanyWizard />;
}
