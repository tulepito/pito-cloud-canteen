import IconBell from '@components/IconBell/IconBell';
import React from 'react';

import css from './AdminHeader.module.scss';

const AdminHeader = () => {
  return (
    <div className={css.root}>
      <div className={css.headerLeft}>
        <IconBell className={css.iconBell} />
        <div className={css.avatar}>
          <span>A</span>
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;
