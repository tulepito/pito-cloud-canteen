import type { ReactNode } from 'react';
import classNames from 'classnames';
import isEmpty from 'lodash/isEmpty';
import Link from 'next/link';
import { useRouter } from 'next/router';

import type { TObject } from '@utils/types';

import css from './FeaturesHeader.module.scss';

export type FeaturesHeaderProps = {
  headerData: {
    key: string;
    icon: ReactNode;
    title: ReactNode;
    pathname: string;
    query?: TObject;
  }[];
};

const FeaturesHeader: React.FC<FeaturesHeaderProps> = (props) => {
  const { headerData } = props;
  const { pathname: routerPathName } = useRouter();
  const { key: activeKey } =
    headerData.find(({ pathname }) =>
      pathname === '/'
        ? routerPathName === pathname
        : routerPathName.includes(pathname),
    ) || {};

  return (
    <nav className={css.container}>
      <ul className={css.navWrapper}>
        {headerData.map(({ key, icon, title, pathname, query }) => {
          const activeHeaderItemClasses = classNames(css.headerItem, {
            [css.active]: key === activeKey,
          });
          const hrefObject = !isEmpty(query) ? { pathname, query } : pathname;

          return (
            <li key={key}>
              <Link className={activeHeaderItemClasses} href={hrefObject}>
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
