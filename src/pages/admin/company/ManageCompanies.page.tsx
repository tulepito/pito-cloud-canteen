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
  paginateCompanies,
} from '@redux/slices/ManageCompaniesPage.slice';
import { ECompanyStatus } from '@utils/enums';
import type {
  TCompany,
  TPagination,
  TReverseMapFromEnum,
  TUser,
} from '@utils/types';
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
      return <span>{data.index + 1}</span>;
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

const parseEntitiesToTableData = (
  companies: TUser[],
  extraData: TExtraDataMapToCompanyTable,
) => {
  return companies.map((company, index) => {
    const companyId = company.id.uuid;
    const {
      profile: {
        displayName,
        publicData: { phoneNumber, companyName } = {},
        metadata: { status } = {},
      },
      email,
    } = company.attributes;

    return {
      key: companyId,
      data: {
        index,
        id: companyId,
        name: displayName,
        phone: phoneNumber,
        email,
        companyName,
        status: status || ECompanyStatus.unactive,
        ...extraData,
      },
    };
  });
};

const sliceCompanies = (
  companies: TCompany[],
  pagination?: TPagination | null,
) => {
  if (!pagination) return companies;
  return companies.slice(
    (pagination.page - 1) * pagination.perPage,
    pagination.page * pagination.perPage,
  );
};

const filterCompanies = (companies: TCompany[], filterValues: any) => {
  const { keyword = '', status } = filterValues;
  const keywordAsLowerCase = keyword.toLowerCase();
  if (!keywordAsLowerCase && !status) return companies;
  if (!keywordAsLowerCase && status) {
    return companies.filter(
      (company: TCompany) =>
        Number(status) === company.attributes.profile.metadata?.status,
    );
  }
  if (keywordAsLowerCase && !status) {
    return companies.filter((company) => {
      const {
        profile: { displayName, publicData: { companyName, phoneNumber } = {} },
        email,
      } = company.attributes;

      return (
        company.id.uuid.toLowerCase().includes(keywordAsLowerCase) ||
        displayName.toLowerCase().includes(keywordAsLowerCase) ||
        companyName.toLowerCase(keywordAsLowerCase).includes(keyword) ||
        phoneNumber?.toLowerCase().includes(keywordAsLowerCase) ||
        email.toLowerCase().includes(keywordAsLowerCase)
      );
    });
  }
  return companies.filter((company) => {
    const {
      profile: { displayName, publicData: { companyName, phoneNumber } = {} },
      email,
    } = company.attributes;

    return (
      Number(status) === company.attributes.profile.metadata?.status &&
      (company.id.uuid.toLowerCase().includes(keywordAsLowerCase) ||
        displayName.toLowerCase().includes(keywordAsLowerCase) ||
        companyName.toLowerCase().includes(keywordAsLowerCase) ||
        phoneNumber?.toLowerCase().includes(keywordAsLowerCase) ||
        email.toLowerCase().includes(keywordAsLowerCase))
    );
  });
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

  const {
    companyRefs,
    queryCompaniesInProgress,
    queryCompaniesError,
    pagination,
  } = useAppSelector((state) => state.ManageCompaniesPage);

  const dispatch = useAppDispatch();

  const keywordAsString = keyword as string;

  const companies = useMemo(
    () =>
      filterCompanies(sliceCompanies(companyRefs, pagination), {
        status,
        keyword: keywordAsString,
      }),
    [companyRefs, pagination, keywordAsString, status],
  ) as TUser[];

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
  }, [page]);

  useEffect(() => {
    if (!page) return;
    dispatch(paginateCompanies(parseInt(page as string, 10)));
  }, [page]);

  const onSearchKeyword = (values: TKeywordSearchFormValues) => {
    router.push({
      pathname,
      query: {
        ...query,
        keyword: values.keyword,
      },
    });
  };

  const onSelectFilter = (values: any) => {
    router.push({
      pathname,
      query: {
        ...query,
        ...values,
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
          paginationPath="/admin/company"
        />
      )}
      {queryCompaniesError && (
        <ErrorMessage message={queryCompaniesError.message} />
      )}
    </div>
  );
}
