import Button from '@components/Button/Button';
import IconEdit from '@components/IconEdit/IconEdit';
import IconEye from '@components/IconEye/IconEye';
import type { TColumn } from '@components/Table/Table';
import Table from '@components/Table/Table';
import ToggleButton from '@components/ToggleButton/ToggleButton';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { managePartnerThunks } from '@redux/slices/ManagePartnersPage.slice';
import { getMarketplaceEntities } from '@utils/data';
import { ECompanyStatus } from '@utils/enums';
import classNames from 'classnames';
import Link from 'next/link';
import React, { useEffect, useMemo } from 'react';

import css from './ManagePartners.module.scss';

type TManagePartnersPage = {};

const TABLE_COLUMN: TColumn[] = [
  {
    key: 'id',
    label: '#',
    render: (data: any) => {
      return <span>{data.index + 1}</span>;
    },
  },
  {
    key: 'name',
    label: 'Tên thương hiệu',
    render: (data: any) => {
      return <span>{data.name}</span>;
    },
  },
  {
    key: 'phone',
    label: 'Số điện thoại',
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
    label: 'Địa chỉ',
    render: (data: any) => {
      return <span>{data.companyName}</span>;
    },
  },
  {
    key: 'status',
    label: 'Trạng thái',
    render: (data: any) => {
      const onClick = (checked: boolean) => {
        const status = checked
          ? ECompanyStatus.active
          : ECompanyStatus.unactive;
        const updateData = {
          id: data.id,
          status,
        };
        data.updateStatus(updateData);
      };
      return (
        <ToggleButton
          name={data.id}
          id={data.id}
          onClick={onClick}
          defaultValue={data.status === ECompanyStatus.active}
        />
      );
    },
  },
  {
    key: 'action',
    label: '',
    render: (data: any) => {
      return (
        <div className={css.tableActions}>
          <Link href={`/admin/company/${data.id}/edit`}>
            <Button className={classNames(css.actionButton, css.editButton)}>
              <IconEdit />
            </Button>
          </Link>
          <Link href={`/admin/company/${data.id}`}>
            <Button className={classNames(css.actionButton, css.editButton)}>
              <IconEye />
            </Button>
          </Link>
        </div>
      );
    },
  },
];

const ManagePartnersPage: React.FC<TManagePartnersPage> = () => {
  const { partnerRefs } = useAppSelector((state) => state.ManageParnersPage);
  const marketplaceData = useAppSelector((state) => state.marketplaceData);
  const dispatch = useAppDispatch();
  const partners = useMemo(() => {
    return getMarketplaceEntities({ marketplaceData }, partnerRefs);
  }, [partnerRefs]);
  console.log(partners);
  useEffect(() => {
    dispatch(managePartnerThunks.queryPartners({}));
  }, []);

  return (
    <div className={css.root}>
      <Table
        columns={TABLE_COLUMN}
        data={[]}
        pagination={{ page: 1, perPage: 10, totalItems: 100, totalPages: 10 }}
        paginationPath="/admin/partner"
      />
    </div>
  );
};

export default ManagePartnersPage;
