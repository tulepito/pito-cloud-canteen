import IconHome from '@components/IconHome/IconHome';
import IconMenuArrow from '@components/IconMenuArrow/IconMenuArrow';
import IconUserManagement from '@components/IconUserManagement/IconUserManagement';
import PitoLogo from '@components/PitoLogo/PitoLogo';
import type { TIconProps } from '@utils/types';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';

import css from './AdminSidebar.module.scss';

type TSidebarChildrenEntity = {
  id: string | number;
  label: string;
  childrenEntities?: TSidebarChildrenEntity[];
  nameLink?: string;
  Icon?: React.FC<TIconProps>;
};

type TSidebarEntity = {
  id: string | number;
  label: string;
  childrenEntities?: TSidebarChildrenEntity[];
  nameLink?: string;
  Icon?: React.FC<TIconProps>;
};

type TListMenuProps = {
  entity: TSidebarEntity;
};

type TListSubMenuProps = {
  entities: TSidebarChildrenEntity[];
};

const SIDEBAR_ENTITIES = [
  {
    id: 'home',
    label: 'AdminSidebar.homeLabel',
    nameLink: 'Home',
    Icon: IconHome,
  },
  {
    id: 'user',
    label: 'AdminSidebar.userLabel',
    Icon: IconUserManagement,
    childrenEntities: [
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
      {
        id: 'custom',
        label: 'AdminSidebar.customLabel',
        childrenEntities: [
          {
            id: 'custom1',
            label: 'AdminSidebar.customLabel',
            childrenEntities: [
              {
                id: 'custom11',
                label: 'AdminSidebar.customLabel',
                nameLink: 'Custom11',
              },
              {
                id: 'custom22',
                label: 'AdminSidebar.customLabel',
                nameLink: 'Custom22',
              },
            ],
          },
          {
            id: 'custom2',
            label: 'AdminSidebar.customLabel',
            nameLink: 'Custom2',
          },
        ],
      },
    ],
  },
];

const SubMenu = (props: TListSubMenuProps) => {
  const { entities } = props;
  return (
    <div className={css.subEntities}>
      {entities.map((entity: TSidebarChildrenEntity) => {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        return <ListMenu key={entity.id} entity={entity} />;
      })}
    </div>
  );
};

const ListMenu = (props: TListMenuProps) => {
  const { entity } = props;
  const intl = useIntl();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const { Icon, label, childrenEntities, nameLink } = entity;

  const hasChildrenEntities = childrenEntities && childrenEntities.length > 0;

  const handleMenuClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    if (nameLink) {
      return router.push(nameLink);
    }
    return setIsOpen(!isOpen);
  };

  return (
    <div onClick={handleMenuClick} className={css.entityRoot}>
      <div className={css.entityWrapper}>
        <div className={css.entity}>
          {Icon && <Icon className={css.entityIcon} />}
          <p className={classNames(css.label, { [css.labelOpen]: isOpen })}>
            {intl.formatMessage({
              id: label,
            })}
          </p>
        </div>
        {hasChildrenEntities && (
          <IconMenuArrow
            className={classNames(css.menuArrowIcon, {
              [css.menuArrowOpen]: isOpen,
            })}
          />
        )}
      </div>
      {isOpen && hasChildrenEntities && <SubMenu entities={childrenEntities} />}
    </div>
  );
};

const MutilLevelMenu = (props: any) => {
  const { entities } = props;
  return (
    <div className={css.listEntities}>
      {entities.map((entity: TSidebarEntity) => {
        return <ListMenu entity={entity} key={entity.id} />;
      })}
    </div>
  );
};

const AdminSidebar = () => {
  return (
    <div className={css.root}>
      <div className={css.top}>
        <PitoLogo />
      </div>
      <div className={css.center}>
        <MutilLevelMenu entities={SIDEBAR_ENTITIES} />
      </div>
    </div>
  );
};

export default AdminSidebar;
