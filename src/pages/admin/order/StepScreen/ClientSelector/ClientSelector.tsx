import ConfirmationModal from '@components/ConfirmationModal/ConfirmationModal';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import {
  manageCompaniesThunks,
  paginateCompanies,
} from '@redux/slices/ManageCompaniesPage.slice';
import { OrderAsyncAction } from '@redux/slices/Order.slice';
import type { TUpdateStatus } from '@src/pages/admin/company/helpers';
import {
  filterCompanies,
  parseEntitiesToTableData,
  sliceCompanies,
  sortCompanies,
} from '@src/pages/admin/company/helpers';
import KeywordSearchForm from '@src/pages/admin/partner/components/KeywordSearchForm/KeywordSearchForm';
import { adminRoutes } from '@src/paths';
import { Listing } from '@utils/data';
import isEmpty from 'lodash/isEmpty';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';

import ClientTable from '../../create/components/ClientTable/ClientTable';
import css from './ClientSelector.module.scss';

type TClientSelector = {
  nextTab: () => void;
};

const ClientSelector: React.FC<TClientSelector> = (props) => {
  const { nextTab } = props;
  const router = useRouter();
  const intl = useIntl();
  const [queryParams, setQueryParams] = useState({});
  const [page, setPage] = useState<number>(1);
  const { value: isSortAZ, toggle: toggleSort } = useBoolean(true);
  const dispatch = useAppDispatch();
  const { companyRefs, totalItems } = useAppSelector(
    (state) => state.ManageCompaniesPage,
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
  // const fetchBookersError = useAppSelector(
  //   (state) => state.Order.fetchBookersError,
  // );
  const {
    value: createOrderFailingModalOpen,
    setTrue: openCreateOrderFailingModal,
    setFalse: closeCreateOrderFailingModal,
  } = useBoolean(!!createOrderError);
  useEffect(() => {
    dispatch(paginateCompanies({ page }));
  }, [dispatch, page]);
  useEffect(() => {
    if (createOrderError) {
      openCreateOrderFailingModal();
    }
  }, [createOrderError, openCreateOrderFailingModal]);
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
  const filteredCompanies = useMemo(
    () => filterCompanies(companyRefs, queryParams),
    [queryParams, companyRefs],
  );
  const sortedCompanies = useMemo(
    () => sortCompanies(filteredCompanies, isSortAZ),
    [filteredCompanies, isSortAZ],
  );
  const slicesCompanies = useMemo(
    () => sliceCompanies(sortedCompanies, page),
    [sortedCompanies, page],
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
  const onItemClick = (id: string) => {
    dispatch(OrderAsyncAction.fetchCompanyBookers(id));
  };

  const onSubmit = (values: any) => {
    const { clientId, booker } = values;
    dispatch(
      OrderAsyncAction.createOrder({
        clientId,
        bookerId: booker,
      }),
    ).then((res) => {
      const { payload, meta } = res;
      if (meta.requestStatus !== 'rejected') {
        nextTab();
        router.push({
          pathname: adminRoutes.EditOrder.path,
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
          searchValue="searchCompanyName"
          onSubmit={(values: any) => {
            setQueryParams(values);
          }}
        />
      </div>
      <div className={css.clientTable}>
        <ClientTable
          data={companiesTableData}
          page={page}
          totalItems={totalItemsPagination}
          onPageChange={onPageChange}
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
