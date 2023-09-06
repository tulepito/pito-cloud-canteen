import { useEffect } from 'react';
import { useRouter } from 'next/router';

import { useViewport } from '@hooks/useViewport';
import { partnerPaths } from '@src/paths';

export const useNavigateToAccountSettingsPage = () => {
  const { isMobileLayout } = useViewport();
  const router = useRouter();

  useEffect(() => {
    if (!isMobileLayout) {
      router.push(partnerPaths.AccountSettings);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobileLayout]);
};
