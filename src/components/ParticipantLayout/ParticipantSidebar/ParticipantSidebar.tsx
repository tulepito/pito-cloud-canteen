import React from 'react';

import type { TSidebarMenu } from '@components/MultiLevelSidebar/MultiLevelSidebar';
import MultiLevelSidebar from '@components/MultiLevelSidebar/MultiLevelSidebar';
import { participantPaths } from '@src/paths';

import css from './ParticipantSidebar.module.scss';

type TParticipantSidebarProps = {
  title: string;
};

const ParticipantSidebar: React.FC<TParticipantSidebarProps> = ({ title }) => {
  const SIDEBAR_MENUS: TSidebarMenu[] = [
    {
      id: 'profile',
      label: 'ParticipantSidebar.profile',
      nameLink: participantPaths.AccountProfile,
      isFirstLevel: true,
    },
    {
      id: 'changePassword',
      label: 'ParticipantSidebar.changePassword',
      nameLink: participantPaths.AccountChangePassword,
      isFirstLevel: true,
    },
    {
      id: 'nutrition',
      label: 'ParticipantSidebar.nutrition',
      nameLink: participantPaths.AccountSpecialDemand,
      isFirstLevel: true,
    },
  ];

  return (
    <div className={css.root}>
      <div className={css.title}>{title}</div>
      <MultiLevelSidebar menus={SIDEBAR_MENUS} />
    </div>
  );
};

export default ParticipantSidebar;
