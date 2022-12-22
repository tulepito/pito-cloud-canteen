import Button from '@components/Button/Button';
import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import IconAdd from '@components/IconAdd/IconAdd';
import IconEdit from '@components/IconEdit/IconEdit';
import IconEye from '@components/IconEye/IconEye';
import IconSpinner from '@components/IconSpinner/IconSpinner';
import Meta from '@components/Layout/Meta';
import SelectSingleFilterPopup from '@components/SelectSingleFilterPopup/SelectSingleFilterPopup';
import type { TColumn } from '@components/Table/Table';
import Table from '@components/Table/Table';
import ToggleButton from '@components/ToggleButton/ToggleButton';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import {
  manageCompaniesThunks,
  RESULT_PAGE_SIZE,
} from '@redux/slices/ManageCompaniesPage.slice';
import { ECompanyStatus } from '@utils/enums';
import type { TCompany, TReverseMapFromEnum, TUser } from '@utils/types';
import classNames from 'classnames';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo } from 'react';
import { useIntl } from 'react-intl';

import type { TKeywordSearchFormValues } from './components/KeywordSearchForm/KeywordSearchForm';
import KeywordSearchForm from './components/KeywordSearchForm/KeywordSearchForm';
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
    render: (data: any) => {
      return <span className={css.rowText}>{data.order}</span>;
    },
  },
  {
    key: 'name',
    label: 'Họ và tên',
    render: (data: any) => {
      return <span className={css.rowText}>{data.name}</span>;
    },
  },
  {
    key: 'phone',
    label: 'Số điện thoại',
    render: (data: any) => {
      return <span className={css.rowText}>{data.phone}</span>;
    },
  },
  {
    key: 'email',
    label: 'Email',
    render: (data: any) => {
      return <span className={css.rowText}>{data.email}</span>;
    },
  },
  {
    key: 'companyName',
    label: 'Tên công ty',
    render: (data: any) => {
      return <span className={css.rowText}>{data.companyName}</span>;
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
          className={css.toggleButton}
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

const parseEntitiesToTableData = (
  companies: TUser[],
  extraData: TExtraDataMapToCompanyTable,
) => {
  return companies.map((company: any) => ({
    key: company.id.uuid,
    data: {
      order: company.order,
      id: company.id.uuid,
      name: company.attributes.profile.displayName,
      phone: company.attributes.profile.publicData?.phoneNumber,
      email: company.attributes.email,
      companyName: company.attributes.profile.publicData?.companyName,
      status:
        company.attributes.profile.metadata.status || ECompanyStatus.unactive,
      ...extraData,
    },
  }));
};

const sliceCompanies = (companies: TCompany[], page: any) => {
  const parsedCompanies = companies.map((item: TCompany, index: number) => ({
    ...item,
    order: index + 1,
  }));
  const pageAsNum = Number(page);

  return parsedCompanies.slice(
    (pageAsNum - 1) * RESULT_PAGE_SIZE,
    pageAsNum * RESULT_PAGE_SIZE,
  );
};

const filterCompanies = (companies: TCompany[], filterValues: any) => {
  const { keyword = '', status } = filterValues;
  const keywordAsLowerCase = keyword.toLowerCase();
  if (!keywordAsLowerCase && !status) return companies;

  if (!keywordAsLowerCase && status) {
    return companies.filter(
      (company: TCompany) =>
        Number(status) === company.attributes.profile.metadata.status,
    );
  }

  if (keywordAsLowerCase && !status) {
    return companies.filter(
      (company) =>
        company.id.uuid.toLowerCase().includes(keywordAsLowerCase) ||
        company.attributes.profile.displayName
          ?.toLowerCase()
          ?.includes(keywordAsLowerCase) ||
        company.attributes.profile.publicData?.companyName
          ?.toLowerCase(keywordAsLowerCase)
          ?.includes(keyword) ||
        company.attributes.profile.publicData?.phoneNumber
          ?.toLowerCase()
          ?.includes(keywordAsLowerCase) ||
        company.attributes.email.toLowerCase().includes(keywordAsLowerCase),
    );
  }
  return companies.filter(
    (company) =>
      Number(status) === company.attributes.profile.metadata.status &&
      (company.id.uuid.toLowerCase().includes(keywordAsLowerCase) ||
        company.attributes.profile.displayName
          ?.toLowerCase()
          ?.includes(keywordAsLowerCase) ||
        company.attributes.profile.publicData?.companyName
          ?.toLowerCase()
          ?.includes(keywordAsLowerCase) ||
        company.attributes.profile.publicData?.phoneNumber
          ?.toLowerCase()
          ?.includes(keywordAsLowerCase) ||
        company.attributes.email.toLowerCase().includes(keywordAsLowerCase)),
  );
};

const companyStatusOptions = [
  {
    key: String(ECompanyStatus.active),
    label: 'Active',
  },
  {
    key: String(ECompanyStatus.unactive),
    label: 'Unactive',
  },
];

export default function ManageCompanies() {
  const intl = useIntl();
  const { value: mounted, setValue: setMounted } = useBoolean(false);
  const router = useRouter();
  const { query, pathname } = router;
  const { page = 1, keyword = '', status } = query;
  const title = intl.formatMessage({
    id: 'ManageCompanies.title',
  });

  const description = intl.formatMessage({
    id: 'ManageCompanies.description',
  });

  const { companyRefs, queryCompaniesInProgress, queryCompaniesError } =
    useAppSelector((state) => state.ManageCompaniesPage);

  const dispatch = useAppDispatch();

  const keywordAsString = keyword as string;

  const filteredCompanies = useMemo(
    () =>
      filterCompanies(companyRefs, {
        status,
        keyword: keywordAsString,
      }),
    [keywordAsString, companyRefs, status],
  );

  const slicesCompanies = useMemo(
    () => sliceCompanies(filteredCompanies, page),
    [filteredCompanies, page],
  );

  const pagination = {
    page: Number(page),
    perPage: RESULT_PAGE_SIZE,
    totalPages: Math.ceil(filteredCompanies.length / RESULT_PAGE_SIZE),
    totalItems: filteredCompanies.length,
  };

  const updateStatus = useCallback(
    (updateData: TUpdateStatus) => {
      dispatch(
        manageCompaniesThunks.updateCompanyStatus({
          dataParams: updateData,
          queryParams: { expand: true },
        }),
      );
    },
    [dispatch, manageCompaniesThunks],
  );

  const companiesTableData = useMemo(
    () =>
      parseEntitiesToTableData(slicesCompanies, {
        updateStatus,
      }),
    [slicesCompanies, updateStatus],
  );

  useEffect(() => {
    if (!!page && !mounted) {
      dispatch(
        manageCompaniesThunks.queryCompanies(parseInt(page as string, 10)),
      );
      setMounted(true);
    }
  }, [page, mounted]);

  const onSearchKeyword = (values: TKeywordSearchFormValues) => {
    router.replace({
      pathname,
      query: {
        ...values,
      },
    });
  };

  const onSelectFilter = (values: any) => {
    router.replace({
      pathname,
      query: {
        ...values,
        ...query,
      },
    });
  };

  const singleFilterInitialValues = useMemo(() => ({ status }), [status]);

  const keywordSearchInitialValues = useMemo(
    () => ({ keyword: keywordAsString }),
    [keywordAsString],
  );

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
      <div className={css.filterWrapper}>
        <KeywordSearchForm
          initialValues={keywordSearchInitialValues}
          onSubmit={onSearchKeyword}
        />
        <SelectSingleFilterPopup
          className={css.singleFilter}
          options={companyStatusOptions}
          label={intl.formatMessage({ id: 'ManageCompanies.status' })}
          queryParamNames="status"
          onSelect={onSelectFilter}
          initialValues={singleFilterInitialValues}
        />
      </div>
      {queryCompaniesInProgress ? (
        <div className={css.loadingContainer}>
          <IconSpinner className={css.spinner} />
        </div>
      ) : (
        <Table
          columns={TABLE_COLUMN}
          data={companiesTableData}
          pagination={pagination}
          pageSearchParams={query}
          paginationPath="/admin/company"
        />
      )}
      {queryCompaniesError && (
        <ErrorMessage message={queryCompaniesError.message} />
      )}
    </div>
  );
}
