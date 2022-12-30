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
import { useCallback, useEffect, useMemo, useState } from 'react';
import { shallowEqual } from 'react-redux';

import ClientTable from '../../create/components/ClientTable/ClientTable';
import css from './ClientSelector.module.scss';

const ClientSelector = () => {
  const [queryParams, setQueryParams] = useState({});
  const [page, setPage] = useState<number>(1);
  const dispatch = useAppDispatch();
  const { companyRefs, totalItems } = useAppSelector(
    (state) => state.ManageCompaniesPage,
    shallowEqual,
  );

  useEffect(() => {
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
    setPage(value);
  };
  return (
    <div>
      <div className={css.header}>
        <div className={css.title}>Chon khach hang</div>
        <div className={css.amount}>1212</div>
      </div>
      <div className={css.searchInput}>
        <KeywordSearchForm
          onSubmit={(values: any) => {
            setQueryParams(values);
          }}
        />
      </div>
      <div className={css.clientTable}>
        <ClientTable
          data={companiesTableData}
          page={page}
          totalItems={totalItems}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
};

export default ClientSelector;
