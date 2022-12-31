import IconArrow from '@components/IconArrow/IconArrow';
import classNames from 'classnames';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import css from './AdminBreadCrumbs.module.scss';

type TPath = {
  path: string;
  label: string;
};

type TPaths = Record<string, TPath>;

export const paths: TPaths = {
  Dashboard: {
    path: '/admin',
    label: 'Trang chủ',
  },
  ManageUsers: {
    path: '/admin/users',
    label: 'Quản lý người dùng',
  },
  ManageCompanies: {
    path: '/admin/company',
    label: 'Quản lý khách hàng',
  },
  EditCompany: {
    path: '/admin/company/[companyId]/edit',
    label: 'Chỉnh sửa khách hàng',
  },
  CreateCompany: {
    path: '/admin/company/create',
    label: 'Tạo khách hàng',
  },
  ManagePartners: {
    path: '/admin/partner',
    label: 'Quản lý đối tác',
  },
  CreatePartner: {
    path: '/admin/partner/create',
    label: 'Tạo đối tác',
  },
  EditPartner: {
    path: '/admin/partner/[partnerId]/edit',
    label: 'Chỉnh sửa đối tác',
  },
  ManageOrders: {
    path: '/admin/order',
    label: 'Quản lý đơn hàng',
  },
  CreateOrder: {
    path: '/admin/order/create',
    label: 'Tạo đơn hàng',
  },
};

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
      const activeKey = Object.keys(paths).find((key: any) => {
        return paths[key].path === currentRoute;
      }) as string;
      const crumb = {
        link,
        route,
        label: paths?.[activeKey]?.label,
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
