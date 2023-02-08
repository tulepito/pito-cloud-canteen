import IconArrow from '@components/Icons/IconArrow/IconArrow';
import { adminRoutes } from '@src/paths';
import type { AdminRouteKey } from '@utils/types';
import classNames from 'classnames';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import css from './AdminBreadCrumbs.module.scss';

const combineAccumulatively = (segments: string[], isAdminRoute: boolean) => {
  const links = segments.reduce(
    (acc: string[], cur: string, curIndex: number) => {
      const last = curIndex > 1 ? acc[curIndex - 1] : '';
      const newPath = `${last}/${cur}`;
      acc.push(newPath);
      return acc;
    },
    [],
  );

  if (isAdminRoute) {
    return links.filter((l: string) => l !== '/');
  }
  return links;
};

type TCrumb = {
  label: string;
  link: string;
  route: string;
};

export const BreadCrumbs = () => {
  const { route, pathname, asPath } = useRouter();

  const [crumbs, setCrumbs] = useState<TCrumb[]>([]);

  useEffect(() => {
    const isAdminRoute = pathname.startsWith('/admin');
    const segmentsPath = asPath.split('/');
    const segmentsRoute = route.split('/');
    const crumbLinks = combineAccumulatively(segmentsPath, isAdminRoute);
    const crumbLabels = combineAccumulatively(segmentsRoute, isAdminRoute);
    const newCrumbs = crumbLinks.map((link: string, index: number) => {
      const currentRoute = crumbLabels[index];
      const activeKey = Object.keys(adminRoutes).find((key) => {
        return adminRoutes[key as AdminRouteKey].path === currentRoute;
      }) as AdminRouteKey;
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
      {crumbs.map((c: TCrumb, i: number) => {
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
