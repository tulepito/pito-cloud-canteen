import Meta from '@components/Layout/Meta';
import type { TColumn, TRowData } from '@components/Table/Table';
import Table from '@components/Table/Table';
import React from 'react';
import { useIntl } from 'react-intl';

const TABLE_COLUMN: TColumn[] = [
  {
    key: 'id',
    label: 'id',
    render: (data: any) => {
      return <span>{data.id}</span>;
    },
  },
  {
    key: 'name',
    label: 'Ho va Ten',
    render: (data: any) => {
      return <span>{data.name}</span>;
    },
  },
  {
    key: 'phone',
    label: 'So dien thoai',
    render: (data: any) => {
      return <span>{data.phone}</span>;
    },
  },
  {
    key: 'email',
    label: 'Email',
    render: (data: any) => {
      return <span>{data.email}</span>;
    },
  },
  {
    key: 'companyName',
    label: 'Ten cong ty',
    render: (data: any) => {
      return <span>{data.companyName}</span>;
    },
  },
  {
    key: 'status',
    label: 'Trang thai',
    render: (data: any) => {
      return <span>{data.status}</span>;
    },
  },
  {
    key: 'action',
    label: '',
    render: () => {
      return <button>Hello</button>;
    },
  },
];

const TABLE_DATA: TRowData[] = [
  {
    key: '1',
    data: {
      id: 1,
      name: 'Minh',
      phone: '094213213',
      email: 'minttran.9002@gmail.com',
      companyName: 'Journey Horizon',
      status: 'active',
    },
  },
  {
    key: '1',
    data: {
      id: 1,
      name: 'Minh',
      phone: '094213213',
      email: 'minttran.9002@gmail.com',
      companyName: 'Journey Horizon',
      status: 'active',
    },
  },
  {
    key: '1',
    data: {
      id: 1,
      name: 'Minh',
      phone: '094213213',
      email: 'minttran.9002@gmail.com',
      companyName: 'Journey Horizon',
      status: 'active',
    },
  },
  {
    key: '1',
    data: {
      id: 1,
      name: 'Minh',
      phone: '094213213',
      email: 'minttran.9002@gmail.com',
      companyName: 'Journey Horizon',
      status: 'active',
    },
  },
  {
    key: '1',
    data: {
      id: 1,
      name: 'Minh',
      phone: '094213213',
      email: 'minttran.9002@gmail.com',
      companyName: 'Journey Horizon',
      status: 'active',
    },
  },
  {
    key: '1',
    data: {
      id: 1,
      name: 'Minh',
      phone: '094213213',
      email: 'minttran.9002@gmail.com',
      companyName: 'Journey Horizon',
      status: 'active',
    },
  },
];

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
      <Table columns={TABLE_COLUMN} rowDatas={TABLE_DATA} />
    </>
  );
};

export default AdminDashboard;
