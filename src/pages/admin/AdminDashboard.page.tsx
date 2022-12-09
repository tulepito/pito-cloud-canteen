import AdminHeader from '@components/AdminHeader/AdminHeader';
import AdminSidebar from '@components/AdminSidebar/AdminSidebar';
import Meta from '@components/Layout/Meta';
import React from 'react';
import { useIntl } from 'react-intl';

import css from './AdminDashboard.module.scss';

const AdminDashboard = () => {
  const intl = useIntl();
  const title = intl.formatMessage({
    id: 'AdminDashboard.title',
  });

  const description = intl.formatMessage({
    id: 'AdminDashboard.description',
  });
  return (
    <>
      <Meta title={title} description={description} />
      <div className={css.page}>
        <AdminSidebar />
        <AdminHeader />
      </div>
    </>
  );
};

export default AdminDashboard;
