import Button from '@components/Button/Button';
import IconAdd from '@components/IconAdd/IconAdd';
import IconEdit from '@components/IconEdit/IconEdit';
import IconEye from '@components/IconEye/IconEye';
import IconMagnifier from '@components/IconMagnifier/IconMagnifier';
import IconSpinner from '@components/IconSpinner/IconSpinner';
import Meta from '@components/Layout/Meta';
import type { TColumn } from '@components/Table/Table';
import Table from '@components/Table/Table';
import ToggleButton from '@components/ToggleButton/ToggleButton';
import useBoolean from '@hooks/useBoolean';
import { useAppDispatch, useAppSelector } from '@redux/reduxHooks';
import {
  manageCompaniesThunks,
  paginateCompanies,
} from '@redux/slices/ManageCompaniesPage.slice';
import type { RootState } from '@redux/store';
import { getMarketplaceEntities } from '@utils/data';
import { ECompanyStatus } from '@utils/enums';
import type { TPagination, TReverseMapFromEnum, TUser } from '@utils/types';
import classNames from 'classnames';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { ChangeEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';

import css from './ManageCompanies.module.scss';

type TUpdateStatus = {
  id: string;
  status: TReverseMapFromEnum<ECompanyStatus>;
};

type TExtraDataMapToCompanyTable = {
  updateStatus: (e: TUpdateStatus) => void;
};

const TABLE_COLUMN: TColumn[] = [
  {
    key: 'id',
    label: '#',
    render: (_: any, index: number) => {
      return <span>{index + 1}</span>;
    },
  },
  {
    key: 'name',
    label: 'Họ và tên',
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
    label: 'Tên công ty',
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

const parseEntitiesToTableData = (
  companies: TUser[],
  extraData: TExtraDataMapToCompanyTable,
) => {
  return companies.map((company) => ({
    key: company.id.uuid,
    data: {
      id: company.id.uuid,
      name: company.attributes.profile.displayName,
      phone: company.attributes.profile.publicData?.phoneNumber,
      email: company.attributes.email,
      companyName: company.attributes.profile.displayName,
      status:
        company.attributes.profile.metadata.status || ECompanyStatus.unactive,
      ...extraData,
    },
  }));
};

const sliceCompanies = (
  companies: TUser[],
  pagination?: TPagination | null,
) => {
  if (!pagination) return companies;
  return companies.slice(
    (pagination.page - 1) * pagination.perPage,
    pagination.page * pagination.perPage,
  );
};

const filterCompanies = (companies: TUser[], keyword: string) => {
  if (!keyword) return companies;
  return companies.filter((company) => {
    if (
      company.id.uuid.toLowerCase().includes(keyword) ||
      company.attributes.profile.displayName.toLowerCase().includes(keyword) ||
      company.attributes.profile.privateData?.phoneNumber
        ?.toLowerCase()
        .includes(keyword) ||
      company.attributes.email.toLowerCase().includes(keyword)
    ) {
      return true;
    }
    return false;
  });
};

export default function ManageCompanies() {
  const intl = useIntl();
  const { value: mounted, setValue: setMounted } = useBoolean(false);
  const [keywordValue, setKeyWordValue] = useState<string>('');
  const router = useRouter();
  const { query, pathname } = router;
  const { page = 1, keyword = '' } = query;
  const title = intl.formatMessage({
    id: 'ManageCompanies.title',
  });

  const description = intl.formatMessage({
    id: 'ManageCompanies.description',
  });

  const {
    companyRefs,
    queryCompaniesInProgress,
    queryCompaniesError,
    pagination,
  } = useAppSelector((state) => state.ManageCompaniesPage);

  const dispatch = useAppDispatch();

  const marketplaceData = useSelector(
    (state: RootState) => state?.marketplaceData,
  );

  const keywordAsString = keyword as string;

  const companies = useMemo(
    () =>
      filterCompanies(
        sliceCompanies(
          getMarketplaceEntities({ marketplaceData }, companyRefs),
          pagination,
        ),
        keywordAsString.toLowerCase(),
      ),
    [companyRefs, pagination, keywordAsString],
  ) as TUser[];

  const updateStatus = (updateData: TUpdateStatus) => {
    dispatch(
      manageCompaniesThunks.updateCompanyStatus({ dataParams: updateData }),
    );
  };

  const companiesTableData = useMemo(
    () =>
      parseEntitiesToTableData(companies, {
        updateStatus,
      }),
    [companies, updateStatus],
  );

  useEffect(() => {
    if ((!page && companyRefs.length === 0) || mounted) return;
    dispatch(
      manageCompaniesThunks.queryCompanies(parseInt(page as string, 10)),
    );
    setMounted(true);
  }, [page, mounted, companyRefs]);

  useEffect(() => {
    if (!page) return;
    dispatch(paginateCompanies(parseInt(page as string, 10)));
  }, [page]);

  const onKeywordInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setKeyWordValue(e.target.value);
  };

  const onSearchKeyword = () => {
    router.push({
      pathname,
      query: {
        keyword: keywordValue,
      },
    });
  };

  return (
    <div className={css.root}>
      <Meta title={title} description={description} />
      <div className={css.top}>
        <h1 className={css.title}>{title}</h1>
        <Link href={`${pathname}/create`}>
          <Button className={css.addButton}>
            <IconAdd className={css.addIcon} />
          </Button>
        </Link>
      </div>
      <div className={css.searchWrapper}>
        <input
          name="keyword"
          id="keyword"
          onChange={onKeywordInputChange}
          className={css.searchInput}
        />
        <Button className={css.searchButton} onClick={onSearchKeyword}>
          <IconMagnifier className={css.iconSearch} />
        </Button>
      </div>
      {queryCompaniesInProgress ? (
        <IconSpinner className={css.spinner} />
      ) : (
        <Table
          columns={TABLE_COLUMN}
          data={companiesTableData}
          pagination={pagination}
          paginationPath="/admin/companies"
        />
      )}
      {queryCompaniesError && <p>{queryCompaniesError.message}</p>}
    </div>
  );
}
