/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { shallowEqual } from 'react-redux';
import { useRouter } from 'next/router';

import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { companyThunks, paginateCompanies } from '@redux/slices/company.slice';
import { orderAsyncActions, removeBookerList } from '@redux/slices/Order.slice';
import type { TUpdateStatus } from '@src/pages/admin/company/helpers';
import {
  filterCompaniesByCompanyName,
  parseEntitiesToTableData,
} from '@src/pages/admin/company/helpers';
import { adminPaths } from '@src/paths';
import { ECompanyStates } from '@src/utils/enums';
import { Listing } from '@utils/data';

import ClientTable from '../../components/ClientTable/ClientTable';

import css from './ClientView.module.scss';

type TClientSelector = {
  nextTab: () => void;
};

const ClientSelector: React.FC<TClientSelector> = (props) => {
  const { nextTab } = props;
  const router = useRouter();
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const dispatch = useAppDispatch();
  const { companyRefs } = useAppSelector(
    (state) => state.company,
    shallowEqual,
  );

  const bookerList = useAppSelector(
    (state) => state.Order.bookerList,
    shallowEqual,
  );
  const fetchBookersInProgress = useAppSelector(
    (state) => state.Order.fetchBookersInProgress,
  );

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

  const updateStatus = useCallback((updateData: TUpdateStatus) => {
    dispatch(companyThunks.adminUpdateCompanyState(updateData));
  }, []);

  const filteredCompanies = useMemo(
    () => filterCompaniesByCompanyName(companyRefs, ''),
    [JSON.stringify(companyRefs)],
  );

  const companiesTableData = useMemo(
    () =>
      parseEntitiesToTableData(filteredCompanies, {
        updateStatus,
      }),
    [JSON.stringify(filteredCompanies), updateStatus],
  );

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
    <div className={css.clientTable}>
      <ClientTable
        data={companiesTableData}
        page={page}
        pageSize={pageSize}
        totalItems={1}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        onItemClick={onItemClick}
        onSubmit={onSubmit}
        bookerList={bookerList}
        fetchBookersInProgress={fetchBookersInProgress}
      />
    </div>
  );
};

export default ClientSelector;
