/* eslint-disable import/no-cycle */
/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useMemo, useState } from 'react';
import isEmpty from 'lodash/isEmpty';

import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { companyThunks } from '@redux/slices/company.slice';
import { orderAsyncActions } from '@redux/slices/Order.slice';
import type { TUpdateStatus } from '@src/pages/admin/company/helpers';
import { parseEntitiesToTableData } from '@src/pages/admin/company/helpers';
import { User } from '@utils/data';

import ClientTable from '../../components/ClientTable/ClientTable';
import NavigateButtons, {
  EFlowType,
} from '../../components/NavigateButtons/NavigateButtons';

import css from './ClientView.module.scss';

type TClientView = {
  nextTab: () => void;
  nextToReviewTab: () => void;
};

const ClientView: React.FC<TClientView> = (props) => {
  const { nextTab, nextToReviewTab } = props;
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const dispatch = useAppDispatch();

  const selectedCompany = useAppSelector(
    (state) => state.Order.selectedCompany,
  );
  const bookerList = useAppSelector((state) => state.Order.bookerList);
  const selectedBooker = useAppSelector((state) => state.Order.selectedBooker);
  const fetchBookersInProgress = useAppSelector(
    (state) => state.Order.fetchBookersInProgress,
  );
  const shouldShowUI =
    selectedBooker !== null && !isEmpty(bookerList) && selectedCompany !== null;
  const companyId = User(selectedCompany).getId();

  useEffect(() => {
    if (companyId && isEmpty(bookerList)) {
      dispatch(orderAsyncActions.fetchCompanyBookers(companyId));
    }
  }, [companyId, JSON.stringify(bookerList)]);

  const updateStatus = useCallback((updateData: TUpdateStatus) => {
    dispatch(companyThunks.adminUpdateCompanyState(updateData));
  }, []);

  const companiesTableData = useMemo(
    () =>
      parseEntitiesToTableData([selectedCompany], {
        updateStatus,
      }),
    [JSON.stringify(selectedCompany), updateStatus],
  );

  const handlePageChange = (value: number) => {
    setPage(value);
  };
  const handlePageSizeChange = (value: number, pageSizeValue: number) => {
    setPageSize(pageSizeValue);
  };
  const handleSelectClientClick = () => {};

  return (
    <div>
      {shouldShowUI && (
        <>
          <div className={css.clientTable}>
            <ClientTable
              data={companiesTableData}
              shouldHidePagination
              shouldDisableAllFields
              shouldHideSubmitBtn
              initialValues={{
                clientId: companyId,
                booker: User(selectedBooker).getId(),
              }}
              page={page}
              pageSize={pageSize}
              totalItems={1}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              onItemClick={handleSelectClientClick}
              onSubmit={nextTab}
              bookerList={bookerList}
              fetchBookersInProgress={fetchBookersInProgress}
            />
          </div>
          <NavigateButtons
            onNextClick={nextTab}
            onCompleteClick={nextToReviewTab}
            flowType={EFlowType.edit}
          />
        </>
      )}
    </div>
  );
};

export default ClientView;
