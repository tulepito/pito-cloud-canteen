import { useCallback, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';
import isEmpty from 'lodash/isEmpty';
import { useRouter } from 'next/router';

import ConfirmationModal from '@components/ConfirmationModal/ConfirmationModal';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { companyThunks, paginateCompanies } from '@redux/slices/company.slice';
import { orderAsyncActions, removeBookerList } from '@redux/slices/Order.slice';
import type { TUpdateStatus } from '@src/pages/admin/company/helpers';
import {
  filterCompaniesByCompanyName,
  parseEntitiesToTableData,
  sliceCompanies,
  sortCompanies,
} from '@src/pages/admin/company/helpers';
import KeywordSearchForm from '@src/pages/admin/partner/components/KeywordSearchForm/KeywordSearchForm';
import { adminPaths } from '@src/paths';
import { ECompanyStates } from '@src/utils/enums';
import { Listing } from '@utils/data';

import ClientTable from '../../components/ClientTable/ClientTable';

import css from './ClientSelector.module.scss';

type TClientSelector = {
  nextTab: () => void;
};

const ClientSelector: React.FC<TClientSelector> = (props) => {
  const { nextTab } = props;
  const router = useRouter();
  const intl = useIntl();
  const [queryParams, setQueryParams] = useState<any>({});
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const { value: isSortAZ, toggle: toggleSort } = useBoolean(true);
  const dispatch = useAppDispatch();
  const { companyRefs, totalItems } = useAppSelector(
    (state) => state.company,
    shallowEqual,
  );

  const [totalItemsPagination, setTotalItemsPagination] =
    useState<number>(totalItems);

  const bookerList = useAppSelector(
    (state) => state.Order.bookerList,
    shallowEqual,
  );
  const fetchBookersInProgress = useAppSelector(
    (state) => state.Order.fetchBookersInProgress,
  );
  const createOrderInProgress = useAppSelector(
    (state) => state.Order.createOrderInProcess,
  );
  const createOrderError = useAppSelector(
    (state) => state.Order.createOrderError,
  );

  const {
    value: createOrderFailingModalOpen,
    setTrue: openCreateOrderFailingModal,
    setFalse: closeCreateOrderFailingModal,
  } = useBoolean(!!createOrderError);

  useEffect(() => {
    dispatch(
      companyThunks.adminQueryCompanies({
        queryParams: {
          meta_userState: ECompanyStates.published,
        },
      }),
    );
    dispatch(removeBookerList());
  }, [dispatch]);

  useEffect(() => {
    dispatch(paginateCompanies({ page, perPage: pageSize }));
  }, [dispatch, page, pageSize]);
  useEffect(() => {
    if (createOrderError) {
      openCreateOrderFailingModal();
    }
  }, [createOrderError, openCreateOrderFailingModal]);

  const updateStatus = useCallback((updateData: TUpdateStatus) => {
    dispatch(companyThunks.adminUpdateCompanyState(updateData));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredCompanies = useMemo(
    () => filterCompaniesByCompanyName(companyRefs, queryParams?.companyName),
    [queryParams, companyRefs],
  );
  const sortedCompanies = useMemo(
    () => sortCompanies(filteredCompanies, isSortAZ),
    [filteredCompanies, isSortAZ],
  );
  const slicesCompanies = useMemo(
    () => sliceCompanies(sortedCompanies, page, pageSize),
    [sortedCompanies, page, pageSize],
  );
  const companiesTableData = useMemo(
    () =>
      parseEntitiesToTableData(slicesCompanies, {
        updateStatus,
      }),
    [slicesCompanies, updateStatus],
  );

  useEffect(() => {
    if (!isEmpty(queryParams)) {
      setTotalItemsPagination(filteredCompanies.length);
    } else {
      setTotalItemsPagination(totalItems);
    }
  }, [filteredCompanies.length, queryParams, totalItems]);
  const onPageChange = (value: number) => {
    setPage(value);
  };
  const onPageSizeChange = (value: number, pageSizeValue: number) => {
    setPageSize(pageSizeValue);
  };
  const onItemClick = (id: string) => {
    dispatch(orderAsyncActions.fetchCompanyBookers(id));
  };

  const onSubmit = (values: any) => {
    const { clientId, booker } = values;
    dispatch(
      orderAsyncActions.createOrder({
        clientId,
        bookerId: booker,
        isCreatedByAdmin: true,
      }),
    ).then((res) => {
      const { payload, meta } = res;

      if (meta.requestStatus !== 'rejected') {
        nextTab();
        router.push({
          pathname: adminPaths.UpdateDraftOrder,
          query: {
            orderId: Listing(payload).getId(),
          },
        });
      }
    });
  };

  return (
    <div>
      <div className={css.header}>
        <div className={css.title}>
          {intl.formatMessage({ id: 'ClientSelector.title' })}
        </div>
        <div className={css.amount}>{totalItemsPagination}</div>
      </div>
      <div className={css.searchInput}>
        <KeywordSearchForm
          placeholder={intl.formatMessage({
            id: 'ClientSelector.keywordFieldPlaceholder',
          })}
          searchValue="companyName"
          onSubmit={(values: any) => {
            setQueryParams(values);
            setPage(1);
          }}
        />
      </div>
      <div className={css.clientTable}>
        <ClientTable
          data={companiesTableData}
          page={page}
          pageSize={pageSize}
          totalItems={totalItemsPagination}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          onItemClick={onItemClick}
          onSubmit={onSubmit}
          bookerList={bookerList}
          createOrderInProgress={createOrderInProgress}
          fetchBookersInProgress={fetchBookersInProgress}
          toggleSort={toggleSort}
        />
      </div>
      <ConfirmationModal
        id="CreateOrderFailingModal"
        isOpen={createOrderFailingModalOpen}
        onClose={closeCreateOrderFailingModal}
        onConfirm={closeCreateOrderFailingModal}
        title={intl.formatMessage({
          id: 'ClientSelector.createOrderFail.title',
        })}
        confirmText="Đóng"
      />
    </div>
  );
};

export default ClientSelector;
