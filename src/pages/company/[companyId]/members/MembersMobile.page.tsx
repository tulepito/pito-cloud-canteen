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

const MEMBERS_MOBILE_TAB_KEYS = {
  members: 'MemberList',
  groups: 'groupList',
};

const MembersMobilePage = () => {
  const intl = useIntl();
  const router = useRouter();

  const [currentTab, setCurrentTab] = useState(MEMBERS_MOBILE_TAB_KEYS.members);

  const handleTabChanged = (params: TTabsItem) => {
    const { id = MEMBERS_MOBILE_TAB_KEYS.members } = params || {};

    setCurrentTab(id.toString());
  };

  const tabItems = [
    {
      key: MEMBERS_MOBILE_TAB_KEYS.members,
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
      key: MEMBERS_MOBILE_TAB_KEYS.groups,
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
            currentTab === MEMBERS_MOBILE_TAB_KEYS.members ? 1 : 2
          }`}
        />
      </div>
    </div>
  );
};

export default MembersMobilePage;
