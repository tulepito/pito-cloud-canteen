import AdminSidebar from '@components/AdminSidebar/AdminSidebar';
import Meta from '@components/Layout/Meta';
import React from 'react';
import { useIntl } from 'react-intl';

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
      <AdminSidebar />
    </>
  );
};

export default AdminDashboard;
