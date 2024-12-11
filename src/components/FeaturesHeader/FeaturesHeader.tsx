import type { ReactNode } from 'react';
import classNames from 'classnames';
import isEmpty from 'lodash/isEmpty';
import Link from 'next/link';
import { useRouter } from 'next/router';

import type { TObject } from '@utils/types';

import cssDefault from './FeaturesHeader.module.scss';

export type FeaturesHeaderProps = {
  headerData: {
    key: string;
    title: ReactNode;
    pathname: string;
    query?: TObject;
    shouldActivePathname?: string[];
    extraFunc?: () => void;
  }[];
  cssCustom?: {
    readonly [key: string]: string;
  };
};

const FeaturesHeader: React.FC<FeaturesHeaderProps> = (props) => {
  const { headerData, cssCustom } = props;
  const { pathname: routerPathName } = useRouter();

  const { key: activeKey } =
    headerData.find(({ pathname, shouldActivePathname }) =>
      pathname === '/'
        ? routerPathName === pathname
        : routerPathName.includes(pathname) ||
          shouldActivePathname?.includes(routerPathName),
    ) || {};

  const css = cssCustom || cssDefault;

  return (
    <nav className={css.container}>
      <ul className={css.navWrapper}>
        {headerData.map(({ key, title, pathname, query, extraFunc }) => {
          if (typeof extraFunc === 'function') {
            return (
              <div key={key} className={css.headerItem} onClick={extraFunc}>
                {title}
              </div>
            );
          }

          const activeHeaderItemClasses = classNames(css.headerItem, {
            [css.active]: key === activeKey,
          });
          const hrefObject = !isEmpty(query) ? { pathname, query } : pathname;

          return (
            <li key={key}>
              <Link className={activeHeaderItemClasses} href={hrefObject}>
                <div className={css.title}>{title}</div>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default FeaturesHeader;
