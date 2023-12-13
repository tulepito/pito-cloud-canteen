/* eslint-disable react-hooks/exhaustive-deps */
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { useRouter } from 'next/router';

import IconArrow from '@components/Icons/IconArrow/IconArrow';
import type { TTabsItem } from '@components/Tabs/Tabs';
import Tabs from '@components/Tabs/Tabs';
import { personalPaths } from '@src/paths';

import CompanyMembersListMobile from './components/CompanyMembersListMobile/CompanyMembersListMobile';

import css from './MembersMobile.module.scss';

const MembersTab = {
  MembersList: 'MemberList',
  GroupList: 'groupList',
};

const MembersMobilePage = () => {
  const intl = useIntl();
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState<string>(MembersTab.MembersList);

  const handleTabChanged = (params: TTabsItem) => {
    const { id = MembersTab.MembersList } = params || {};

    setCurrentTab(id.toString());
  };

  const tabItems = [
    {
      key: MembersTab.MembersList,
      label: (
        <div className={css.tabLabel}>
          <span>
            {intl.formatMessage({
              id: 'CompanySidebar.memberList',
            })}
          </span>
        </div>
      ),
      childrenFn: () => {
        return <CompanyMembersListMobile />;
      },
    },
    {
      key: MembersTab.GroupList,
      label: (
        <div className={css.tabLabel}>
          <span>
            {intl.formatMessage({
              id: 'CompanySidebar.groupList',
            })}
          </span>
        </div>
      ),
      childrenFn: () => {
        return <h1>Group List</h1>;
      },
    },
  ];
  const navigateAccountPersonalPage = () => {
    router.push({
      pathname: personalPaths.Account,
      query: { companyId: 'personal' },
    });
  };

  const defaultActiveKey = tabItems.findIndex(
    (item: any) => item.key === currentTab,
  );

  return (
    <div className={css.container}>
      <div className={css.header}>
        <IconArrow direction="left" onClick={navigateAccountPersonalPage} />
        <span>{intl.formatMessage({ id: 'MembersPage.membersTitle' })}</span>
      </div>
      <div className={css.tabContainer}>
        <Tabs
          headerClassName={css.headerClassName}
          tabItemClassName={css.tabItemClassName}
          headerWrapperClassName={css.headerWrapperClassName}
          items={tabItems as any}
          onChange={handleTabChanged}
          defaultActiveKey={`${
            (defaultActiveKey < 0 ? 0 : defaultActiveKey) + 1
          }`}
        />
      </div>
    </div>
  );
};

export default MembersMobilePage;
