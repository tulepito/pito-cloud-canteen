import Button, { InlineTextButton } from '@components/Button/Button';
import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import IconAdd from '@components/IconAdd/IconAdd';
import IconEdit from '@components/IconEdit/IconEdit';
import IconEye from '@components/IconEye/IconEye';
import Meta from '@components/Layout/Meta';
import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import SelectSingleFilterPopup from '@components/SelectSingleFilterPopup/SelectSingleFilterPopup';
import type { TColumn } from '@components/Table/Table';
import Table from '@components/Table/Table';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { managePartnerThunks } from '@redux/slices/ManagePartnersPage.slice';
import { EListingStates, ERestaurantListingState } from '@utils/enums';
import classNames from 'classnames';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { PREVIEW_TAB } from './components/EditPartnerWizard/EditPartnerWizard';
import KeywordSearchForm from './components/KeywordSearchForm/KeywordSearchForm';
import css from './ManagePartners.module.scss';

type TManagePartnersPage = {};

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
  },
  {
    key: 'title',
    label: 'Tên thương hiệu',
    render: (data: any) => {
      return (
        <div className={classNames(css.rowText, css.rowTitle)}>
          <span>{data.title}</span>
          {data.isDraft && (
            <div className={css.draftBox}>
              <FormattedMessage id="ManagePartnersPage.draftState" />
            </div>
          )}
        </div>
      );
    },
  },
  {
    key: 'phoneNumber',
    label: 'Số điện thoại',
    render: (data: any) => {
      return <span className={css.rowText}>{data.phoneNumber}</span>;
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
    key: 'address',
    label: 'Địa chỉ',
    render: (data: any) => {
      return <span className={css.rowText}>{data.address}</span>;
    },
  },
  {
    key: 'action',
    label: '',
    render: (data: any) => {
      return (
        <div className={css.tableActions}>
          <Link href={`/admin/partner/${data.id}/edit`}>
            <InlineTextButton
              className={classNames(css.actionButton, css.editButton)}>
              <IconEdit />
            </InlineTextButton>
          </Link>
          <Link href={`/admin/partner/${data.id}/edit?tab=${PREVIEW_TAB}`}>
            <InlineTextButton
              className={classNames(css.actionButton, css.editButton)}>
              <IconEye />
            </InlineTextButton>
          </Link>
        </div>
      );
    },
  },
];

const parseEntitiesToTableData = (entityRefs: any[]) => {
  if (entityRefs.length === 0) return [];
  return entityRefs.map((entity: any) => {
    return {
      key: entity.id.uuid,
      data: {
        isDraft:
          entity.attributes.metadata.listingState === EListingStates.draft,
        id: entity.id.uuid,
        title: entity.attributes.title,
        phoneNumber: entity.attributes.publicData.phoneNumber,
        email: entity.author.attributes.email,
        address: entity.attributes.publicData.location.address,
        status: entity.attributes.metadata.listingState,
      },
    };
  });
};

const PARTNER_LISTING_STATUS = Object.keys(ERestaurantListingState).map(
  (key: string) => {
    return {
      key,
      label: `ManagePartnersPage.${key}`,
    };
  },
);

const ManagePartnersPage: React.FC<TManagePartnersPage> = () => {
  const {
    restaurantRefs,
    pagination,
    queryRestaurantsInProgress,
    queryRestaurantsError,
  } = useAppSelector((state) => state.ManageParnersPage);
  const router = useRouter();
  const { query, pathname } = router;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { page = 1, keywords = '', meta_listingState = '' } = query;
  const intl = useIntl();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(managePartnerThunks.queryRestaurants({ page, keywords }));
  }, [page]);

  const dataTable = useMemo(
    () => parseEntitiesToTableData(restaurantRefs),
    [restaurantRefs],
  );

  const onSubmit = (values: any) => {
    router.replace({
      pathname,
      query: {
        ...values,
        page: 1,
      },
    });
  };

  let content;
  if (queryRestaurantsInProgress) {
    content = <LoadingContainer />;
  } else if (queryRestaurantsError) {
    content = <ErrorMessage message={queryRestaurantsError.message} />;
  } else if (restaurantRefs.length > 0) {
    content = (
      <>
        <Table
          columns={TABLE_COLUMN}
          data={dataTable}
          pagination={pagination}
          paginationPath="/admin/partner"
        />
      </>
    );
  } else {
    content = (
      <p>
        <FormattedMessage id="ManagePartners.noResults" />
      </p>
    );
  }

  const title = intl.formatMessage({
    id: 'ManagePartners.title',
  });

  const description = intl.formatMessage({
    id: 'ManagePartners.description',
  });

  return (
    <div className={css.root}>
      <Meta title={title} description={description} />
      <div className={css.top}>
        <h1 className={css.title}>{title}</h1>
        <Link href={`/admin/partner/create`}>
          <Button className={css.addButton}>
            <IconAdd className={css.addIcon} />
          </Button>
        </Link>
      </div>
      <div className={css.filterWrapper}>
        <KeywordSearchForm
          onSubmit={onSubmit}
          initialValues={{ keywords: keywords as string }}
        />
        <SelectSingleFilterPopup
          className={css.singleFilter}
          options={PARTNER_LISTING_STATUS}
          label={intl.formatMessage({ id: 'ManageCompanies.status' })}
          queryParamNames="meta_listingState"
          onSelect={onSubmit}
          initialValues={{
            meta_listingState: meta_listingState as string,
          }}
        />
      </div>
      {content}
    </div>
  );
};

export default ManagePartnersPage;
