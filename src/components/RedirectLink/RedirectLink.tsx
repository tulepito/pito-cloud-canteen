import { useEffect } from 'react';
import { useRouter } from 'next/router';

import type { TObject } from '@utils/types';

type TRedirectLinkProps = { pathname: string; query?: TObject };

const RedirectLink: React.FC<TRedirectLinkProps> = ({ pathname, query }) => {
  const router = useRouter();
  useEffect(() => {
    router.push({
      pathname,
      query,
    });
  }, [pathname, query, router]);

  return <></>;
};

export default RedirectLink;
