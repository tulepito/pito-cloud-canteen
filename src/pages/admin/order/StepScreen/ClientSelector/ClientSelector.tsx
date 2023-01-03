import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import {
  manageCompaniesThunks,
  paginateCompanies,
} from '@redux/slices/ManageCompaniesPage.slice';
import { addCompanyClient } from '@redux/slices/Order.slice';
import type { TUpdateStatus } from '@src/pages/admin/company/helpers';
import {
  filterCompanies,
  parseEntitiesToTableData,
  sliceCompanies,
} from '@src/pages/admin/company/helpers';
import KeywordSearchForm from '@src/pages/admin/partner/components/KeywordSearchForm/KeywordSearchForm';
import isEmpty from 'lodash/isEmpty';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';

import ClientTable from '../../create/components/ClientTable/ClientTable';
import ConfirmClientModal from '../../create/components/ConfirmClientModal/ConfirmClientModal';
import css from './ClientSelector.module.scss';

const ClientSelector = () => {
  const intl = useIntl();
  const [queryParams, setQueryParams] = useState({});
  const [page, setPage] = useState<number>(1);
  const [selectedConpanyId, setSelectedCompanyId] = useState<string>('');
  const {
    value: isConfirmClientModalOpen,
    setTrue: onConfirmClientModalOpen,
    setFalse: onConfirmClientModalClose,
  } = useBoolean();
  const dispatch = useAppDispatch();
  const { companyRefs, totalItems } = useAppSelector(
    (state) => state.ManageCompaniesPage,
    shallowEqual,
  );
  const [totalItemsPagination, setTotalItemsPagination] =
    useState<number>(totalItems);
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
  const onItemClick = (id: string) => () => {
    setSelectedCompanyId(id);
    onConfirmClientModalOpen();
  };
  const onClientConfirm = () => {
    dispatch(addCompanyClient(selectedConpanyId));
    onConfirmClientModalClose();
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
        />
      </div>
      <ConfirmClientModal
        isOpen={isConfirmClientModalOpen}
        onClose={onConfirmClientModalClose}
        onCancel={onConfirmClientModalClose}
        onConfirm={onClientConfirm}
      />
    </div>
  );
};

export default ClientSelector;
