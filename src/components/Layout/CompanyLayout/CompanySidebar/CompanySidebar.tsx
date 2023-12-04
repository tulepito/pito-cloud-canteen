import React from 'react';
import { useRouter } from 'next/router';

import type { TSidebarMenu } from '@components/MultiLevelSidebar/MultiLevelSidebar';
import MultiLevelSidebar from '@components/MultiLevelSidebar/MultiLevelSidebar';
import { companyPaths, personalPaths } from '@src/paths';

import css from './CompanySidebar.module.scss';

type CompanySidebarProps = {
  companyName: string;
};

const CompanySidebar: React.FC<CompanySidebarProps> = ({ companyName }) => {
  const router = useRouter();
  const { companyId } = router.query;

  const companyMenuOptions =
    companyId && companyId !== 'personal'
      ? [
          {
            id: 'logo',
            label: 'CompanySidebar.logo',
            nameLink: companyPaths.Logo,
            isFirstLevel: true,
          },
        ]
      : [];

  const userMenuOptions =
    companyId === 'personal'
      ? [
          {
            id: 'changePassword',
            label: 'CompanySidebar.passwordSetting',
            nameLink: personalPaths.ChangePassword,
            isFirstLevel: true,
          },
        ]
      : [];
  const SIDEBAR_MENUS: TSidebarMenu[] = [
    {
      id: 'home',
      label: 'CompanySidebar.account',
      nameLink: companyId ? companyPaths.Account : personalPaths.Account,
      isFirstLevel: true,
    },
    ...companyMenuOptions,
    {
      id: 'nutrition',
      label: 'CompanySidebar.nutrition',
      nameLink: companyId ? companyPaths.Nutrition : personalPaths.Nutrition,
      isFirstLevel: true,
    },

    {
      id: 'user',
      label: 'CompanySidebar.members',
      isFirstLevel: true,
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
    ...userMenuOptions,
  ];

  return (
    <div className={css.root}>
      <div className={css.companyName} title={companyName}>
        {companyName}
      </div>
      <MultiLevelSidebar menus={SIDEBAR_MENUS} />
    </div>
  );
};

export default CompanySidebar;
