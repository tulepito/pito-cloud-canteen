import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  manageCompaniesThunks,
  paginateCompanies,
} from '@redux/slices/ManageCompaniesPage.slice';
import KeywordSearchForm from '@src/pages/admin/company/components/KeywordSearchForm/KeywordSearchForm';
import type { TUpdateStatus } from '@src/pages/admin/company/helpers';
import {
  filterCompanies,
  parseEntitiesToTableData,
  sliceCompanies,
} from '@src/pages/admin/company/helpers';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo } from 'react';
import { shallowEqual } from 'react-redux';

import css from './ClientSelector.module.scss';
import ClientTable from './ClientTable';

const ClientSelector = () => {
  const router = useRouter();
  const { page = 1, ...queryParams } = router.query;
  const dispatch = useAppDispatch();
  const { companyRefs, pagination } = useAppSelector(
    (state) => state.ManageCompaniesPage,
    shallowEqual,
  );
  useEffect(() => {
    dispatch(
      manageCompaniesThunks.queryCompanies(parseInt(page as string, 10)),
    );
    dispatch(paginateCompanies({ page }));
  }, [dispatch, page]);

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
  const slicesCompanies = useMemo(
    () => sliceCompanies(filteredCompanies, page),
    [filteredCompanies, page],
  );
  const companiesTableData = useMemo(
    () =>
      parseEntitiesToTableData(slicesCompanies, {
        updateStatus,
      }),
    [slicesCompanies, updateStatus],
  );

  const onPageChange = (value: number) => {
    router.push(`${router.pathname}?page=${value}`);
  };
  return (
    <div>
      <div className={css.header}>
        <div className={css.title}>Chon khach hang</div>
        <div className={css.amount}>1212</div>
      </div>
      <div className={css.searchInput}>
        <KeywordSearchForm onSubmit={() => {}} />
      </div>
      <div className={css.clientTable}>
        <ClientTable
          data={companiesTableData}
          pagination={pagination}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
};

export default ClientSelector;
