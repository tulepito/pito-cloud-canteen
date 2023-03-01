import { useAppSelector } from '@hooks/reduxHooks';
import { companyPaths } from '@src/paths';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { shallowEqual } from 'react-redux';

const useRedirectAfterReloadPage = () => {
  const router = useRouter();
  const selectedCompany = useAppSelector(
    (state) => state.Quiz.selectedCompany,
    shallowEqual,
  );
  useEffect(() => {
    if (!selectedCompany) {
      router.push(companyPaths.CreateNewOrder);
    }
  }, [router, selectedCompany]);
};

export default useRedirectAfterReloadPage;
