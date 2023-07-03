import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import Link from 'next/link';
import { useRouter } from 'next/router';

import IconArrow from '@components/Icons/IconArrow/IconArrow';
import { partnerRoutes } from '@src/paths';
import type { PartnerRouteKey } from '@utils/types';

import css from './PartnerBreadCrumbs.module.scss';

const combineAccumulatively = (segments: string[], isMatchRole: boolean) => {
  const links = segments.reduce(
    (acc: string[], cur: string, curIndex: number) => {
      const last = curIndex > 1 ? acc[curIndex - 1] : '';
      const newPath = `${last}/${cur}`;
      acc.push(newPath);

      return acc;
    },
    [],
  );

  if (isMatchRole) {
    return links.filter((l: string) => l !== '/');
  }

  return links;
};

type TCrumb = {
  label: string;
  link: string;
  route: string;
};

export const PartnerBreadCrumbs = () => {
  const { route, pathname, asPath } = useRouter();

  const [crumbs, setCrumbs] = useState<TCrumb[]>([]);

  useEffect(() => {
    const isMatchRole = pathname.startsWith('/partner');
    const segmentsPath = asPath.split('/');
    const segmentsRoute = route.split('/');
    const crumbLinks = combineAccumulatively(segmentsPath, isMatchRole);
    const crumbLabels = combineAccumulatively(segmentsRoute, isMatchRole);
    const newCrumbs = crumbLinks.map((link: string, index: number) => {
      const currentRoute = crumbLabels[index];
      const activeKey = Object.keys(partnerRoutes).find((key) => {
        return partnerRoutes[key as PartnerRouteKey].path === currentRoute;
      }) as PartnerRouteKey;
      const crumb = {
        link,
        route,
        label: partnerRoutes?.[activeKey]?.label,
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
