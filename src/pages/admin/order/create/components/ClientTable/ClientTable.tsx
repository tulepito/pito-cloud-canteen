import { useState } from 'react';
import type { FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { FormattedMessage, useIntl } from 'react-intl';
import classNames from 'classnames';

import Avatar from '@components/Avatar/Avatar';
import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldRadioButton from '@components/FormFields/FieldRadioButton/FieldRadioButton';
import IconMail from '@components/Icons/IconMail/IconMail';
import IconPhone from '@components/Icons/IconPhone/IconPhone';
import IconSpinner from '@components/Icons/IconSpinner/IconSpinner';
import Pagination from '@components/Pagination/Pagination';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { addBooker } from '@redux/slices/Order.slice';
import { User } from '@utils/data';
import type { TUser } from '@utils/types';

import IconNoClientsFound from './IconNoClientsFound';

import css from './ClientTable.module.scss';

type ClientTableProps = {
  data: any[];
  totalItems: number;
  page: number;
  pageSize: number;
  bookerList: TUser[];
  fetchBookersInProgress: boolean;
  createOrderInProgress: boolean;
  onPageChange: (value: number) => void;
  onItemClick?: (value: string) => void;
  onSubmit: (values: any) => void;
  toggleSort: () => void;
  onPageSizeChange?: (value: number, perPageValue: number) => void;
};

const ClientTable: React.FC<ClientTableProps> = (props) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const {
    data = [],
    totalItems,
    onPageChange,
    page,
    onItemClick,
    onSubmit,
    bookerList,
    fetchBookersInProgress,
    // toggleSort,
    createOrderInProgress,
    onPageSizeChange,
    pageSize,
  } = props;
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [selectedBookerId, setSelectedBookerId] = useState<string>('');
  const shouldShowPagination = page && data?.length > 0;
  const queryCompaniesInProgress = useAppSelector(
    (state) => state.company.queryCompaniesInProgress,
  );
  const renderTableRowFn = (tableData: any, form: any) => {
    return tableData.map(({ key, data: itemData }: any, index: number) => {
      const onCustomItemClick = () => {
        if (selectedCompanyId === itemData.id) {
          return;
        }
        form.batch(() => {
          form.change('clientId', itemData.id);
          form.change('booker', '');
        });
        setSelectedCompanyId(itemData.id);
        setSelectedBookerId('');
        if (onItemClick) {
          onItemClick(itemData.id);
        }
      };
      const showBookerList =
        selectedCompanyId === itemData.id &&
        bookerList.length > 0 &&
        !fetchBookersInProgress;
      const showLoading =
        selectedCompanyId === itemData.id && fetchBookersInProgress;
      const currentIdx = (page - 1) * pageSize + (index + 1);

      return (
        <div key={key} className={css.bodyRow}>
          <div className={css.mainRow} onClick={onCustomItemClick}>
            <span>
              <FieldRadioButton
                id={`clientId-${itemData.id}`}
                name="clientId"
                value={itemData.id}
              />
            </span>
            <span className={css.bodyCell}>{currentIdx}</span>
            <span className={css.bodyCell}>
              <span>{itemData.companyName}</span>
            </span>
            <span className={css.bodyCell}>{itemData.address}</span>
          </div>

          {showLoading && (
            <div className={css.loading}>
              <IconSpinner className={css.loadingIcon} />
            </div>
          )}
          {showBookerList && (
            <div className={css.bookerList}>
              {bookerList.map((booker) => {
                const handleBookerClick = () => {
                  form.change('booker', User(booker).getId());
                  setSelectedBookerId(User(booker).getId());
                  dispatch(addBooker(booker));
                };
                const bookerCardClasses = classNames(
                  css.bookerCard,
                  selectedBookerId === User(booker).getId() && css.selected,
                );

                return (
                  <div
                    key={User(booker).getId()}
                    className={bookerCardClasses}
                    onClick={handleBookerClick}>
                    <div className={css.profile}>
                      <Avatar user={booker} disableProfileLink />
                      <div className={css.name}>
                        {User(booker).getProfile().displayName}
                      </div>
                    </div>
                    <div className={css.contact}>
                      <div className={css.row}>
                        <IconPhone />
                        <div>{User(booker).getProtectedData().phoneNumber}</div>
                      </div>
                      <div className={css.row}>
                        <IconMail />
                        <div>{User(booker).getAttributes().email}</div>
                      </div>
                    </div>
                    <FieldRadioButton
                      id={`booker-${User(booker).getId()}`}
                      name="booker"
                      value={User(booker).getId()}
                      rootClassName={css.bookerRadio}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    });
  };

  const noClientsFound = (
    <div className={css.noClientsFound}>
      <IconNoClientsFound />
      <div>
        <FormattedMessage id="ClientTable.noClientsFound" />
      </div>
    </div>
  );

  return (
    <FinalForm
      onSubmit={onSubmit}
      render={(formRenderProps: FormRenderProps) => {
        const { handleSubmit, form, values } = formRenderProps;
        const { booker: bookerValue = '', clientId: clientIdValue = '' } =
          values;
        const tableContent =
          data?.length > 0 ? renderTableRowFn(data, form) : noClientsFound;
        const disabled =
          !bookerValue || !clientIdValue || createOrderInProgress;

        return (
          <Form onSubmit={handleSubmit}>
            <div className={css.container}>
              <div className={css.table}>
                <div className={css.header}>
                  <span>&nbsp;</span>
                  <span>{intl.formatMessage({ id: 'ClientTable.id' })}</span>
                  <span className={css.companyNameHeaderCol}>
                    {intl.formatMessage({ id: 'ClientTable.companyName' })}
                    {/* <IconSort className={css.sortIcon} onClick={toggleSort} /> */}
                  </span>
                  <span>
                    {intl.formatMessage({ id: 'ClientTable.address' })}
                  </span>
                </div>
                <div className={css.tableBody}>
                  {queryCompaniesInProgress ? (
                    <div className={css.dataLoading}>
                      {intl.formatMessage({ id: 'ClientTable.loading' })}
                    </div>
                  ) : (
                    tableContent
                  )}
                </div>
              </div>
              {shouldShowPagination && (
                <div className={css.paginationContainer}>
                  <Pagination
                    total={totalItems}
                    pageSize={pageSize}
                    current={page}
                    onChange={onPageChange}
                    showSizeChanger
                    onShowSizeChange={onPageSizeChange}
                  />
                </div>
              )}
            </div>
            <div className={css.submitBtnWrapper}>
              <Button
                className={css.submitBtn}
                inProgress={createOrderInProgress}
                disabled={disabled}>
                {intl.formatMessage({ id: 'ClientTable.submit' })}
              </Button>
            </div>
          </Form>
        );
      }}
    />
  );
};

export default ClientTable;
