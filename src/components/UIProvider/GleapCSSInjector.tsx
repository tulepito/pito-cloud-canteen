'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

import { useViewport } from '@hooks/useViewport';

function GleapCSSInjector() {
  const pathname = usePathname();
  const { isMobileLayout } = useViewport();

  useEffect(() => {
    if (!pathname) return;
    if (pathname.startsWith('/admin/scanner/')) {
      document.body.classList.add('no-gleap');
    }

    if (isMobileLayout) {
      document.body.classList.add('no-gleap');
    } else {
      document.body.classList.remove('no-gleap');
    }
  }, [pathname, isMobileLayout]);

  return null;
}

export default GleapCSSInjector;
