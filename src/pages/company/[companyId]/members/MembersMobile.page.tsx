/* eslint-disable react-hooks/exhaustive-deps */
import type { PropsWithChildren } from 'react';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useRouter } from 'next/router';

import IconArrow from '@components/Icons/IconArrow/IconArrow';
import type { TTabsItem } from '@components/Tabs/Tabs';
import Tabs from '@components/Tabs/Tabs';
import { personalPaths } from '@src/paths';

import css from './MembersMobile.module.scss';

type TMembersMobilePageProps = PropsWithChildren<{
  currentPage: string;
}>;

export const MembersTab = {
  MembersList: 'MemberList',
  GroupList: 'groupList',
};

const MembersMobilePage: React.FC<TMembersMobilePageProps> = ({
  currentPage = MembersTab.MembersList,
  children,
}) => {
  const intl = useIntl();
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState<string>(currentPage);

  const handleTabChanged = (params: TTabsItem) => {
    const { id = MembersTab.MembersList } = params || {};

    setCurrentTab(id.toString());
  };

  const tabItems = [
    {
      id: MembersTab.MembersList,
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
        return <></>;
      },
    },
    {
      id: MembersTab.GroupList,
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
        return <></>;
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
    (item: any) => item.id === currentTab,
  );

  useEffect(() => {
    if (currentTab !== currentPage) {
      if (currentTab === MembersTab.MembersList) {
        router.push(personalPaths.Members);
      } else if (currentTab === MembersTab.GroupList) {
        router.push(personalPaths.GroupList);
      }
    }
  }, [currentTab]);

  return (
    <div className={css.container}>
      <div className={css.header}>
        <IconArrow direction="left" onClick={navigateAccountPersonalPage} />
        <span>{intl.formatMessage({ id: 'CompanySidebar.members' })}</span>
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
        <>{children}</>
      </div>
    </div>
  );
};

export default MembersMobilePage;
