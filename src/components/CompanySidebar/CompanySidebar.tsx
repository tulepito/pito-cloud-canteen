import type { TSidebarMenu } from '@components/MultiLevelSidebar/MultiLevelSidebar';
import MultiLevelSidebar from '@components/MultiLevelSidebar/MultiLevelSidebar';
import PitoLogo from '@components/PitoLogo/PitoLogo';
import React from 'react';

import css from './CompanySidebar.module.scss';

const SIDEBAR_MENUS: TSidebarMenu[] = [
  {
    id: 'home',
    label: 'CompanySidebar.members',
  },
  {
    id: 'user',
    label: 'CompanySidebar.members',
    childrenMenus: [
      {
        id: 'memberList',
        label: 'CompanySidebar.memberList',
        nameLink: 'EmployeeSetting',
      },
      {
        id: 'groupList',
        label: 'CompanySidebar.groupList',
        nameLink: 'GroupSetting',
      },
    ],
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
