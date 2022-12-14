import Meta from '@components/Layout/Meta';
import type { TColumn } from '@components/Table/Table';
import Table from '@components/Table/Table';
import useBoolean from '@hooks/useBoolean';
import { useAppDispatch } from '@redux/reduxHooks';
import {
  manageCompaniesThunks,
  paginateCompanies,
} from '@redux/slices/ManageCompaniesPage.slice';
import type { RootState } from '@redux/store';
import { getMarketplaceEntities } from '@utils/data';
import type { TPagination, TUser } from '@utils/types';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { ChangeEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';

import css from './ManageCompanies.module.scss';

const TABLE_COLUMN: TColumn[] = [
  {
    key: 'id',
    label: '#',
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
      return data.status ? (
        <p className={css.active}>Active</p>
      ) : (
        <p className={css.inActive}>Inactive</p>
      );
    },
  },
  {
    key: 'action',
    label: '',
    render: (data: any) => {
      return (
        <Link href={`/admin/companies/${data.id}`}>
          <FormattedMessage id="ManageCompanies.details" />
        </Link>
      );
    },
  },
];

const parseEntitiesToTableData = (companies: TUser[]) => {
  return companies.map((company) => ({
    key: company.id.uuid,
    data: {
      id: company.id.uuid,
      name: company.attributes.profile.displayName,
      phone: company.attributes.profile.publicData?.phoneNumber,
      email: company.attributes.email,
      companyName: company.attributes.profile.displayName,
      status: true,
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

  const addMessage = intl.formatMessage({
    id: 'ManageCompanies.add',
  });

  const {
    companyRefs,
    queryCompaniesInProgress,
    queryCompaniesError,
    pagination,
  } = useSelector((state: RootState) => state.ManageCompaniesPage);

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

  const companiesTableData = useMemo(
    () => parseEntitiesToTableData(companies),
    [companies],
  );

  const dispatch = useAppDispatch();

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
    <>
      <Meta title={title} description={description} />
      <div className={css.top}>
        <p className={css.title}>{title}</p>
        <Link href={`${pathname}/create`}>
          <button className={css.button}>{addMessage}</button>
        </Link>
      </div>
      <div>
        <input
          name="keyword"
          id="keyword"
          onChange={onKeywordInputChange}
          className={css.searchInput}
        />
        <button className={css.button} onClick={onSearchKeyword}>
          {intl.formatMessage({ id: 'ManageCompanies.search' })}
        </button>
      </div>
      {queryCompaniesInProgress ? (
        <p>Loading</p>
      ) : (
        <Table
          columns={TABLE_COLUMN}
          rowDatas={companiesTableData}
          pagination={pagination}
          paginationPath="/admin/companies"
        />
      )}
      {queryCompaniesError && <p>{queryCompaniesError.message}</p>}
    </>
  );
}
