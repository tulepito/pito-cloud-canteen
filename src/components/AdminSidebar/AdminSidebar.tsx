import PitoLogo from '@components/PitoLogo/PitoLogo';
import type { ReactNode } from 'react';
import React from 'react';
import { useIntl } from 'react-intl';

import css from './AdminSidebar.module.scss';
import IconHome from './icons/IconHome/IconHome';
import IconUserManagement from './icons/IconUserManagement/IconUserManagement';

type TSidebarChildrenEntity = {
  id: string | number;
  label: string;
  childrenEntities?: TSidebarChildrenEntity;
  nameLink?: string;
};

type TSidebarEntity = {
  id: string | number;
  label: string;
  childrenEntities?: TSidebarChildrenEntity;
  nameLink?: string;
  icon: ReactNode;
};

const SIDEBAR_ENTITIES = [
  {
    id: 'home',
    label: 'AdminSidebar.homeLabel',
    nameLink: 'Home',
    icon: <IconHome />,
  },
  {
    id: 'user',
    label: 'AdminSidebar.userLabel',
    icon: <IconUserManagement />,
    children: [
      {
        id: 'company',
        label: 'AdminSidebar.companyLabel',
        nameLink: 'Company',
      },
      {
        id: 'partner',
        label: 'AdminSidebar.partnerLabel',
        nameLink: 'Partner',
      },
    ],
  },
];

const AdminSidebar = () => {
  const intl = useIntl();
  return (
    <div className={css.root}>
      <div className={css.top}>
        <PitoLogo />
      </div>
      <div className={css.center}>
        {SIDEBAR_ENTITIES.map((entity: TSidebarEntity) => {
          return (
            <div key={entity.id} className={css.entityRoot}>
              <div className={css.entity}>
                {entity.icon}
                <p>
                  {intl.formatMessage({
                    id: entity.label,
                  })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminSidebar;
