import Badge, { EBadgeType } from '@components/Badge/Badge';
import Button from '@components/Button/Button';
import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import IconEdit from '@components/Icons/IconEdit/IconEdit';
import Meta from '@components/Layout/Meta';
import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import NamedLink from '@components/NamedLink/NamedLink';
import type { TColumn } from '@components/Table/Table';
import { TableForm } from '@components/Table/Table';
import ToggleButton from '@components/ToggleButton/ToggleButton';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import {
  manageCompaniesThunks,
  RESULT_PAGE_SIZE,
} from '@redux/slices/ManageCompaniesPage.slice';
import { adminRoutes } from '@src/paths';
import { ECompanyStatus } from '@utils/enums';
import type { TUser } from '@utils/types';
import classNames from 'classnames';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';

import KeywordSearchForm from '../partner/components/KeywordSearchForm/KeywordSearchForm';
import type { TUpdateStatus } from './helpers';
import {
  filterCompanies,
  parseEntitiesToTableData,
  sliceCompanies,
} from './helpers';
import css from './ManageCompanies.module.scss';

const TABLE_COLUMN: TColumn[] = [
  {
    key: 'id',
    label: 'ID',
    render: (data: any) => {
      return (
        <div className={css.rowId} title={data.id}>
          {data.id}
        </div>
      );
    },
  },
  {
    key: 'name',
    label: 'Tên công ty',
    render: ({ id, name }: any) => {
      return (
        <NamedLink
          path={`${adminRoutes.ManageCompanies.path}/${id}`}
          className={css.boldTextRow}>
          {name}
        </NamedLink>
      );
    },
  },
  {
    key: 'representatives',
    label: 'Người đại diện',
    render: ({ members = [], id }: any) => {
      return (
        <div>
          {members.slice(0, 1).map((user: TUser) => {
            return (
              <div key={`${id}.${user.id.uuid}`}>
                <div className={css.memberName}>
                  {user.attributes.profile.displayName}
                </div>
                <div className={css.memberEmail}>{user.attributes.email}</div>
                <div className={css.memberPhoneNumber}>
                  {user.attributes.profile.protectedData?.phoneNumber}
                </div>
              </div>
            );
          })}
          {members.length > 1 && (
            <div className={css.membersCount}>
              +{members.length - 1}
              <FormattedMessage id="ManageCompaniesPage.membersCount" />
            </div>
          )}
        </div>
      );
    },
  },
  {
    key: 'address',
    label: 'Địa chỉ',
    render: (data: any) => {
      return <div>{data.address}</div>;
    },
  },
  {
    key: 'status',
    label: 'Trạng thái',
    render: (data: any) => {
      const isActive = data.status === ECompanyStatus.active;
      const label = isActive ? 'Đã active' : 'Chưa active';
      const badgeType = isActive ? EBadgeType.SUCCESS : EBadgeType.DEFAULT;
      return (
        <Badge
          label={label}
          type={badgeType}
          labelClassName={css.badgeLabel}
          className={classNames(css.badgeContainer, {
            [css.badgeContainerActive]: isActive,
          })}
        />
      );
    },
  },
  {
    key: 'action',
    label: '',
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
        <div className={css.tableActions}>
          <Link href={`/admin/company/${data.id}/edit`}>
            <Button className={classNames(css.actionButton, css.editButton)}>
              <IconEdit className={css.iconEdit} />
            </Button>
          </Link>
          <ToggleButton
            name={data.id}
            className={css.toggleButton}
            id={data.id}
            onClick={onClick}
            defaultValue={data.status === ECompanyStatus.active}
          />
        </div>
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

  const {
    companyRefs,
    queryCompaniesInProgress,
    queryCompaniesError,
    companyMembers,
  } = useAppSelector((state) => state.ManageCompaniesPage, shallowEqual);

  const dispatch = useAppDispatch();
  const { keywords } = queryParams;
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
      parseEntitiesToTableData(
        slicesCompanies,
        {
          updateStatus,
        },
        companyMembers,
      ),
    [slicesCompanies, updateStatus, JSON.stringify(companyMembers)],
  );

  useEffect(() => {
    if (!!page && !mounted) {
      dispatch(
        manageCompaniesThunks.queryCompanies(parseInt(page as string, 10)),
      );
      setMounted(true);
    }
  }, [page, mounted]);

  const companyIdsToGetMemberDetails = slicesCompanies.map(
    (company) => company.id.uuid,
  );

  useEffect(() => {
    if (companyIdsToGetMemberDetails.length === 0) return;
    dispatch(
      manageCompaniesThunks.getCompanyMemberDetails(
        companyIdsToGetMemberDetails,
      ),
    );
  }, [JSON.stringify(companyIdsToGetMemberDetails)]);

  const onSearchKeyword = (values: any) => {
    router.replace({
      pathname,
      query: {
        ...values,
        page: 1,
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
            <FormattedMessage id="ManageCompanies.addCompany" />
          </Button>
        </Link>
      </div>
      <div className={css.filterWrapper}>
        <div></div>
        <KeywordSearchForm
          initialValues={{ keywords: keywords as string }}
          onSubmit={onSearchKeyword}
          hideButton
          placeholder={intl.formatMessage({
            id: 'ManageCompanies.keywordsPlaceholder',
          })}
        />
      </div>
      {queryCompaniesInProgress ? (
        <LoadingContainer />
      ) : (
        <TableForm
          onSubmit={onSearchKeyword}
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
