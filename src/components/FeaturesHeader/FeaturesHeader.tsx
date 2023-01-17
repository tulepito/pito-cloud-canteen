import classNames from 'classnames';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { ReactNode } from 'react';

import css from './FeaturesHeader.module.scss';

type FeaturesHeaderProps = {
  headerData: {
    key: string;
    icon: ReactNode;
    title: string | ReactNode;
    pathname: string;
  }[];
};
const FeaturesHeader: React.FC<FeaturesHeaderProps> = (props) => {
  const { headerData } = props;
  const router = useRouter();
  const activeKey = headerData.find(
    (data) => data.pathname === router.pathname,
  )?.key;
  return (
    <nav className={css.container}>
      <ul className={css.navWrapper}>
        {headerData.map(({ key, icon, title, pathname }) => {
          const activeHeaderItemClasses = classNames(css.headerItem, {
            [css.active]: key === activeKey,
          });
          return (
            <li key={key}>
              <Link className={activeHeaderItemClasses} href={pathname}>
                {icon}
                <span className={css.title}>{title}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default FeaturesHeader;
