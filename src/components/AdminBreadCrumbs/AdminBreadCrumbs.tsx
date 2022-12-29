import IconArrow from '@components/IconArrow/IconArrow';
import classNames from 'classnames';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

import css from './AdminBreadCrumbs.module.scss';

const Route2LabelMap = {
  '/admin': 'Trang chủ',
  '/admin/order': 'Quản lý đơn hàng',
  '/admin/order/create': 'Tạo đơn hàng',
  '/admin/company': 'Quản lý khách hàng',
  '/admin/company/create': 'Tạo khách hàng',
  '/admin/company/[companyId]': 'Chi tiết khách hàng',
  '/admin/company/[companyId]/edit': 'Sửa',
  '/admin/partner': 'Quản lý đối tác',
} as any;

const CombineAccumulatively = (segments: any[], isAdminRoute: boolean) => {
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
  const router = useRouter();

  const [crumbs, setCrumbs] = React.useState([]);

  useEffect(() => {
    const isAdminRoute = router.pathname.startsWith('/admin');
    const segmentsPath = router.asPath.split('/');
    const segmentsRoute = router.route.split('/');
    const crumbLinks = CombineAccumulatively(segmentsPath, isAdminRoute);
    const crumbLabels = CombineAccumulatively(segmentsRoute, isAdminRoute);

    const newCrumbs = crumbLinks.map((link: any, index: string | number) => {
      const route = crumbLabels[index];
      const crumb = {
        link,
        route,
        label: Route2LabelMap[route as any] || route,
      };
      return crumb;
    });
    setCrumbs(newCrumbs);
  }, [router.route]);

  return (
    <div className={css.root}>
      {crumbs.map((c: any, i: number) => {
        const isActive = router.pathname === c.link;
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
