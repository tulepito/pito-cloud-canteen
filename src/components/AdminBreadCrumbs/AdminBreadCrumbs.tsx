import IconArrow from '@components/IconArrow/IconArrow';
import { adminRoutes } from '@src/paths';
import type { RouteKey } from '@utils/types';
import classNames from 'classnames';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import css from './AdminBreadCrumbs.module.scss';

const combineAccumulatively = (segments: any[], isAdminRoute: boolean) => {
  const links = segments.reduce((acc, cur, curIndex) => {
    const last = curIndex > 1 ? acc[curIndex - 1] : '';
    const newPath = `${last}/${cur}`;
    acc.push(newPath);
    return acc;
  }, []);

  if (isAdminRoute) {
    return links.filter((l: string) => l !== '/');
  }
  return links;
};

export const BreadCrumbs = () => {
  const { route, pathname, asPath } = useRouter();

  const [crumbs, setCrumbs] = useState([]);

  useEffect(() => {
    const isAdminRoute = pathname.startsWith('/admin');
    const segmentsPath = asPath.split('/');
    const segmentsRoute = route.split('/');
    const crumbLinks = combineAccumulatively(segmentsPath, isAdminRoute);
    const crumbLabels = combineAccumulatively(segmentsRoute, isAdminRoute);
    const newCrumbs = crumbLinks.map((link: any, index: string | number) => {
      const currentRoute = crumbLabels[index];
      const activeKey = Object.keys(adminRoutes).find((key) => {
        return adminRoutes[key as RouteKey].path === currentRoute;
      }) as RouteKey;
      const crumb = {
        link,
        route,
        label: adminRoutes?.[activeKey]?.label,
      };
      return crumb;
    });
    setCrumbs(newCrumbs);
  }, [asPath, pathname, route]);
  return (
    <div className={css.root}>
      {crumbs.map((c: any, i: number) => {
        const isActive = pathname === c.link;
        return (
          <div className={css.crumb} key={i}>
            {i > 0 && i < crumbs.length - 1 && (
              <IconArrow className={css.arrowIcon} direction="right" />
            )}
            <Link href={c.link}>
              <div
                className={classNames(css.label, { [css.active]: isActive })}>
                {c.label}
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
};
