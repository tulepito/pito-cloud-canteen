import type { TObject } from '@utils/types';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

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
