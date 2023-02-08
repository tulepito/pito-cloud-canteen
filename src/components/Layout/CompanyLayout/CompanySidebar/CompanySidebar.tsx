import type { TSidebarMenu } from '@components/MultiLevelSidebar/MultiLevelSidebar';
import MultiLevelSidebar from '@components/MultiLevelSidebar/MultiLevelSidebar';
import { companyPaths, personalPaths } from '@src/paths';
import { useRouter } from 'next/router';
import React from 'react';

import css from './CompanySidebar.module.scss';

const CompanySidebar = () => {
  const router = useRouter();
  const { companyId } = router.query;
  const companyMenuOptions =
    companyId && companyId !== 'personal'
      ? [
          {
            id: 'user',
            label: 'CompanySidebar.members',
            childrenMenus: [
              {
                id: 'memberList',
                label: 'CompanySidebar.memberList',
                nameLink: companyPaths.Members,
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
        ]
      : [];
  const SIDEBAR_MENUS: TSidebarMenu[] = [
    {
      id: 'home',
      label: 'CompanySidebar.account',
      nameLink: companyId ? companyPaths.Account : personalPaths.Account,
    },
    ...companyMenuOptions,
    {
      id: 'nutrition',
      label: 'CompanySidebar.nutrition',
      nameLink: companyId ? companyPaths.Nutrition : personalPaths.Nutrition,
    },
  ];
  return (
    <div className={css.root}>
      <MultiLevelSidebar menus={SIDEBAR_MENUS} />
    </div>
  );
};

export default CompanySidebar;
