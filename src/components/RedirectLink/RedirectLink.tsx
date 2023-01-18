import { useRouter } from 'next/router';
import { useEffect } from 'react';

type RedirectLinkProps = { pathname: string; query?: Record<string, string> };
const RedirectLink: React.FC<RedirectLinkProps> = ({ pathname, query }) => {
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
