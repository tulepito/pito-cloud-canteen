import type { TSidebarMenu } from '@components/MultiLevelSidebar/MultiLevelSidebar';
import MultiLevelSidebar from '@components/MultiLevelSidebar/MultiLevelSidebar';
import PitoLogo from '@components/PitoLogo/PitoLogo';
import { companyPaths } from '@src/paths';
import React from 'react';

import css from './CompanySidebar.module.scss';

const SIDEBAR_MENUS: TSidebarMenu[] = [
  {
    id: 'home',
    label: 'CompanySidebar.account',
    nameLink: companyPaths.ContactPoint,
  },
  {
    id: 'user',
    label: 'CompanySidebar.members',
    childrenMenus: [
      {
        id: 'memberList',
        label: 'CompanySidebar.memberList',
        nameLink: '/company/[companyId]/members',
      },
      {
        id: 'groupList',
        label: 'CompanySidebar.groupList',
        nameLink: companyPaths.GroupSetting,
      },
    ],
  },
  {
    id: 'logo',
    label: 'CompanySidebar.logo',
    nameLink: companyPaths.Logo,
  },
];

const CompanySidebar = () => {
  return (
    <div className={css.root}>
      <div className={css.logo}>
        <PitoLogo />
      </div>
      <MultiLevelSidebar menus={SIDEBAR_MENUS} />
    </div>
  );
};

export default CompanySidebar;
