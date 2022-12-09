import IconBell from '@components/IconBell/IconBell';
import React from 'react';

import css from './AdminHeader.module.scss';

const AdminHeader = () => {
  return (
    <div className={css.root}>
      <div className={css.headerLeft}>
        <IconBell />
      </div>
    </div>
  );
};

export default AdminHeader;
