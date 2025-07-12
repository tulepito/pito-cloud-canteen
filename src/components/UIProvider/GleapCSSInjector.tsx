'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

function GleapCSSInjector() {
  const pathname = usePathname();

  console.log({ pathname });

  useEffect(() => {
    if (!pathname) return;
    if (pathname.startsWith('/admin/scanner/')) {
      document.body.classList.add('no-gleap');
    }

    if (window.innerWidth < 768) {
      document.body.classList.add('mobile-gleap');
    } else {
      document.body.classList.remove('mobile-gleap');
    }
  }, [pathname]);

  return null;
}

export default GleapCSSInjector;
