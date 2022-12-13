import Meta from '@components/Layout/Meta';
import type { TColumn, TRowData } from '@components/Table/Table';
import Table from '@components/Table/Table';
import { useIntl } from 'react-intl';

import css from './CompanyManagement.module.scss';

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

export default function CompanyManagementPage() {
  const intl = useIntl();
  const title = intl.formatMessage({
    id: 'AdminDashboard.title',
  });

  const description = intl.formatMessage({
    id: 'AdminDashboard.description',
  });

  const addMessage = intl.formatMessage({
    id: 'AdminDashboard.add',
  });
  return (
    <>
      <Meta title={title} description={description} />
      <div className={css.top}>
        <p className={css.title}>{title}</p>
        <button className={css.button}>{addMessage}</button>
      </div>
      <Table columns={TABLE_COLUMN} rowDatas={TABLE_DATA} />
    </>
  );
}
