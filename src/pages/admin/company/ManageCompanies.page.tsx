import Button from '@components/Button/Button';
import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import FieldSelect from '@components/FieldSelect/FieldSelect';
import FieldTextInput from '@components/FieldTextInput/FieldTextInput';
import IconAdd from '@components/IconAdd/IconAdd';
import IconEdit from '@components/IconEdit/IconEdit';
import IconEye from '@components/IconEye/IconEye';
import IconMagnifier from '@components/IconMagnifier/IconMagnifier';
import IconSpinner from '@components/IconSpinner/IconSpinner';
import Meta from '@components/Layout/Meta';
import type { TColumn } from '@components/Table/Table';
import { TableForm } from '@components/Table/Table';
import ToggleButton from '@components/ToggleButton/ToggleButton';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import {
  manageCompaniesThunks,
  RESULT_PAGE_SIZE,
} from '@redux/slices/ManageCompaniesPage.slice';
import { ECompanyStatus } from '@utils/enums';
import classNames from 'classnames';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import type { TKeywordSearchFormValues } from './components/KeywordSearchForm/KeywordSearchForm';
import type { TUpdateStatus } from './helpers';
import {
  filterCompanies,
  parseEntitiesToTableData,
  sliceCompanies,
} from './helpers';
import css from './ManageCompanies.module.scss';

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

const TABLE_COLUMN: TColumn[] = [
  {
    key: 'id',
    label: 'ID',
    render: (data: any) => {
      return (
        <span title={data.id} className={classNames(css.rowText, css.rowId)}>
          {data.id}
        </span>
      );
    },
    renderSearch: () => {
      return (
        <FieldTextInput
          className={css.keywordInput}
          name="searchId"
          id="searchId"
        />
      );
    },
  },
  {
    key: 'name',
    label: 'Họ và tên',
    render: (data: any) => {
      return <span className={css.rowText}>{data.name}</span>;
    },
    renderSearch: () => {
      return (
        <FieldTextInput
          className={css.keywordInput}
          name="searchDisplayName"
          id="searchDisplayName"
        />
      );
    },
  },
  {
    key: 'phone',
    label: 'Số điện thoại',
    render: (data: any) => {
      return <span className={css.rowText}>{data.phone}</span>;
    },
    renderSearch: () => {
      return (
        <FieldTextInput
          className={css.keywordInput}
          name="searchPhone"
          id="searchPhone"
        />
      );
    },
  },
  {
    key: 'email',
    label: 'Email',
    render: (data: any) => {
      return <span className={css.rowText}>{data.email}</span>;
    },
    renderSearch: () => {
      return (
        <FieldTextInput
          className={css.keywordInput}
          name="searchEmail"
          id="searchEmail"
        />
      );
    },
  },
  {
    key: 'companyName',
    label: 'Tên công ty',
    render: (data: any) => {
      return <span className={css.rowText}>{data.companyName}</span>;
    },
    renderSearch: () => {
      return (
        <FieldTextInput
          className={css.keywordInput}
          name="searchCompanyName"
          id="searchCompanyName"
        />
      );
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
    renderSearch: () => {
      return (
        <FieldSelect
          className={css.keywordInput}
          name="searchStatus"
          id="searchStatus">
          <option key="" value="">
            <FormattedMessage id="ManageCompanies.searchStatusLabel" />
          </option>
          {companyStatusOptions.map((s: any) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </FieldSelect>
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
    renderSearch: () => {
      return (
        <Button className={css.searchButton}>
          <IconMagnifier className={css.iconSearch} />
        </Button>
      );
    },
  },
];

export default function ManageCompanies() {
  const intl = useIntl();
  const { value: mounted, setValue: setMounted } = useBoolean(false);
  const router = useRouter();
  const { query, pathname } = router;
  const { page = 1, ...queryParams } = query;
  const title = intl.formatMessage({
    id: 'ManageCompanies.title',
  });

  const description = intl.formatMessage({
    id: 'ManageCompanies.description',
  });

  const { companyRefs, queryCompaniesInProgress, queryCompaniesError } =
    useAppSelector((state) => state.ManageCompaniesPage);

  const dispatch = useAppDispatch();

  const filteredCompanies = useMemo(
    () => filterCompanies(companyRefs, queryParams),
    [queryParams, companyRefs],
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
        page: 1,
      },
    });
  };

  const initialValues = useMemo(
    () => queryParams,
    [JSON.stringify(queryParams)],
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
      {queryCompaniesInProgress ? (
        <div className={css.loadingContainer}>
          <IconSpinner className={css.spinner} />
        </div>
      ) : (
        <TableForm
          initialValues={initialValues}
          onSubmit={onSearchKeyword}
          columns={TABLE_COLUMN}
          data={companiesTableData}
          pagination={pagination}
          pageSearchParams={query}
          paginationPath="/admin/company"
          showFilterFrom
        />
      )}
      {queryCompaniesError && (
        <ErrorMessage message={queryCompaniesError.message} />
      )}
    </div>
  );
}
