/* eslint-disable @typescript-eslint/no-shadow */
import Button, { InlineTextButton } from '@components/Button/Button';
import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import FieldMultipleSelect from '@components/FormFields/FieldMultipleSelect/FieldMultipleSelect';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import IconAdd from '@components/Icons/IconAdd/IconAdd';
import IconEdit from '@components/Icons/IconEdit/IconEdit';
import IconSpinner from '@components/Icons/IconSpinner/IconSpinner';
import IntegrationFilterModal from '@components/IntegrationFilterModal/IntegrationFilterModal';
import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import NamedLink from '@components/NamedLink/NamedLink';
import type { TColumn } from '@components/Table/Table';
import { TableForm } from '@components/Table/Table';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { partnerThunks } from '@redux/slices/partners.slice';
import { adminRoutes } from '@src/paths';
import {
  EListingStates,
  ERestaurantListingStatus,
  RESTAURANT_STATUS_OPTIONS,
} from '@utils/enums';
import classNames from 'classnames';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import css from './ManagePartners.module.scss';

type TManagePartnersPage = {};

const TABLE_COLUMN: TColumn[] = [
  {
    key: 'order',
    label: 'STT',
    render: (data: any) => {
      return (
        <div title={data?.id} className={css.rowId}>
          {data?.order}
        </div>
      );
    },
  },
  {
    key: 'title',
    label: 'Tên thương hiệu',
    render: (data: any) => {
      return (
        <NamedLink
          path={`/admin/partner/${data.id}/edit`}
          className={classNames(css.rowText, css.rowTitle)}>
          <div title={data?.title}>{data?.title}</div>
          {data?.isDraft && (
            <div className={css.draftBox}>
              <FormattedMessage id="ManagePartnersPage.draftState" />
            </div>
          )}
        </NamedLink>
      );
    },
  },
  {
    key: 'phoneNumber',
    label: 'Số điện thoại',
    render: (data: any) => {
      return <div className={css.rowText}>{data.phoneNumber}</div>;
    },
  },
  {
    key: 'email',
    label: 'Email',
    render: (data: any) => {
      return <div className={css.rowText}>{data?.email}</div>;
    },
  },
  {
    key: 'address',
    label: 'Địa chỉ',
    render: (data: any) => {
      return (
        <div title={data?.address} className={css.rowText}>
          {data?.address}
        </div>
      );
    },
  },
  {
    key: 'status',
    label: 'Trạng thái',
    render: (data: any) => {
      const isUnsatisfactory =
        data?.status === ERestaurantListingStatus.unsatisfactory;
      const isAuthorized = data?.status === ERestaurantListingStatus.authorized;
      const isNew =
        !data?.status || data?.status === ERestaurantListingStatus.new;

      const classses = classNames(css.rowText, css.badge, {
        [css.unsatisfactoryBox]: isUnsatisfactory,
        [css.authorizedBox]: isAuthorized,
        [css.newBox]: isNew,
      });
      return (
        <div className={classses}>
          <FormattedMessage
            id={`ManagePartnersPage.${
              data?.status || ERestaurantListingStatus.new
            }Status`}
          />
        </div>
      );
    },
  },
  {
    key: 'view',
    label: '',
    render: (data: any) => {
      return (
        <Link href={`/admin/partner/${data?.id}/edit`}>
          <InlineTextButton
            className={classNames(css.actionButton, css.editButton)}>
            <IconEdit className={css.iconEdit} />
          </InlineTextButton>
        </Link>
      );
    },
  },
  {
    key: 'action',
    label: '',
    render: (data: any) => {
      const setAuthorizeHandle = () => {
        data?.onSetAuthorized(data?.id);
      };

      const setUnsatisfactoryHandle = () => {
        data?.onSetUnsatisfactory(data?.id);
      };

      const deleteHandle = () => {
        data?.onDeleteRestaurant({
          partnerId: data?.authorId,
          restaurantId: data?.id,
        });
      };
      const isUnsatisfactory =
        data?.status === ERestaurantListingStatus.unsatisfactory;
      const isAuthorized = data?.status === ERestaurantListingStatus.authorized;
      const isNew =
        !data?.status || data?.status === ERestaurantListingStatus.new;

      return (
        !data?.isDraft && (
          <div className={css.tableActions}>
            {data?.isLoading ? (
              <IconSpinner className={css.loadingIcon} />
            ) : (
              <>
                {(isNew || isUnsatisfactory) && (
                  <InlineTextButton
                    type="button"
                    onClick={setAuthorizeHandle}
                    className={css.actionBtn}>
                    <FormattedMessage id="ManagePartners.authorizeBtn" />
                  </InlineTextButton>
                )}
                {(isNew || isAuthorized) && (
                  <InlineTextButton
                    type="button"
                    onClick={setUnsatisfactoryHandle}
                    className={css.actionBtn}>
                    <FormattedMessage id="ManagePartners.unsatisfactoryBtn" />
                  </InlineTextButton>
                )}
                {!isAuthorized && (
                  <InlineTextButton
                    type="button"
                    onClick={deleteHandle}
                    className={css.actionBtn}>
                    <FormattedMessage id="ManagePartners.deleteBtn" />
                  </InlineTextButton>
                )}
              </>
            )}
          </div>
        )
      );
    },
  },
];

const parseEntitiesToTableData = (
  entityRefs: any[],
  page: number,
  extraData: any = {},
) => {
  if (entityRefs.length === 0) return [];
  return entityRefs.map((entity: any, index: number) => {
    const isLoading = entity.id.uuid === extraData?.loadingId;
    return {
      key: entity.id.uuid,
      data: {
        order: (page - 1) * 10 + index + 1,
        id: entity.id.uuid,
        isDraft:
          entity.attributes.metadata?.listingState === EListingStates.draft,
        title: entity.attributes.title,
        phoneNumber: entity.attributes.publicData?.phoneNumber,
        email: entity.author.attributes.email,
        address: entity.attributes.publicData?.location?.address,
        status: entity.attributes.metadata?.status,
        authorId: entity.author.id.uuid,
        ...extraData,
        isLoading,
      },
    };
  });
};

const ManagePartnersPage: React.FC<TManagePartnersPage> = () => {
  const {
    restaurantRefs,
    pagination,
    queryRestaurantsInProgress,
    queryRestaurantsError,
    restaurantTableActionInProgress,
  } = useAppSelector((state) => state.partners);
  const router = useRouter();
  const { query, pathname } = router;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { page = 1, keywords = '', meta_status = '' } = query;
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const onSetAuthorized = async (id: string) => {
    const params = {
      id,
      status: ERestaurantListingStatus.authorized,
    };
    const response = (await dispatch(
      partnerThunks.setRestaurantStatus(params),
    )) as any;
    if (!response?.error) {
      dispatch(partnerThunks.queryRestaurants({ page, keywords }));
    }
  };

  const onSetUnsatisfactory = async (id: string) => {
    const params = {
      id,
      status: ERestaurantListingStatus.unsatisfactory,
    };
    const response = (await dispatch(
      partnerThunks.setRestaurantStatus(params),
    )) as any;
    if (!response?.error) {
      dispatch(partnerThunks.queryRestaurants({ page, keywords }));
    }
  };

  const onDeleteRestaurant = async ({ partnerId, restaurantId }: any) => {
    const response = (await dispatch(
      partnerThunks.deleteRestaurant({ partnerId, restaurantId }),
    )) as any;
    if (!response?.error) {
      dispatch(partnerThunks.queryRestaurants({ page, keywords }));
    }
  };

  const statusAsString = meta_status as string;

  const groupStatus = statusAsString
    ?.split(',')
    .filter((item: string) => !!item);

  useEffect(() => {
    dispatch(
      partnerThunks.queryRestaurants({
        page,
        keywords,
        ...(meta_status ? { meta_status: groupStatus } : {}),
      }),
    );
  }, [page, keywords, meta_status]);

  const dataTable = useMemo(
    () =>
      parseEntitiesToTableData(restaurantRefs, Number(page), {
        onSetUnsatisfactory,
        onSetAuthorized,
        loadingId: restaurantTableActionInProgress,
        onDeleteRestaurant,
      }),
    [restaurantRefs, restaurantTableActionInProgress, page],
  );

  const onSubmit = ({ keywords, meta_status }: any) => {
    router.replace({
      pathname,
      query: {
        meta_status: meta_status.join(','),
        keywords,
        page: 1,
      },
    });
  };

  const onClear = () => {
    router.replace({
      pathname,
      query: {
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
        <TableForm
          columns={TABLE_COLUMN}
          data={dataTable}
          pagination={pagination}
          paginationPath={adminRoutes.ManagePartners.path}
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

  return (
    <div className={css.root}>
      <div className={css.top}>
        <h1 className={css.title}>{title}</h1>
        <Link href={`/admin/partner/create`}>
          <Button className={css.addButton}>
            <IconAdd className={css.addIcon} />
          </Button>
        </Link>
      </div>
      <div className={css.filterWrapper}>
        <IntegrationFilterModal
          onSubmit={onSubmit}
          onClear={onClear}
          initialValues={{ keywords, meta_status: groupStatus }}>
          {() => (
            <>
              <FieldTextInput
                className={css.field}
                name="keywords"
                id="keywords"
                label="Tên đối tác"
                placeholder="Tìm kiếm"
              />
              <FieldMultipleSelect
                className={css.field}
                name="meta_status"
                id="meta_status"
                label="Trạng thái"
                placeholder="Chọn trạng thái"
                options={RESTAURANT_STATUS_OPTIONS}
              />
            </>
          )}
        </IntegrationFilterModal>
      </div>
      {content}
    </div>
  );
};

export default ManagePartnersPage;
