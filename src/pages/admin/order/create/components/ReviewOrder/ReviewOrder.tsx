import Collapsible from '@components/Collapsible/Collapsible';
import ConfirmationModal from '@components/ConfirmationModal/ConfirmationModal';
import Form from '@components/Form/Form';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import type { TColumn } from '@components/Table/Table';
import Table from '@components/Table/Table';
import Tabs from '@components/Tabs/Tabs';
import { addCommas } from '@helpers/format';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { orderAsyncActions } from '@redux/slices/Order.slice';
import { Listing } from '@utils/data';
import { parseTimestampToFormat } from '@utils/dates';
import type { TListing } from '@utils/types';
import { required } from '@utils/validators';
import classNames from 'classnames';
import arrayMutators from 'final-form-arrays';
import React, { useEffect, useMemo } from 'react';
import { Form as FinalForm } from 'react-final-form';
import { FormattedMessage, useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';

// eslint-disable-next-line import/no-cycle
import NavigateButtons from '../NavigateButtons/NavigateButtons';
import css from './ReviewOrder.module.scss';

const MENU_TABLE_COLUMN: TColumn[] = [
  {
    key: 'stt',
    label: 'STT',
    render: (data: any) => {
      return (
        <span title={data.id} className={classNames(css.rowText, css.rowId)}>
          {data.id}
        </span>
      );
    },
  },
  {
    key: 'foodName',
    label: 'Hạng mục',
    render: (data: any) => {
      return (
        <span title={data.id} className={classNames(css.rowText, css.rowId)}>
          {data.foodName}
        </span>
      );
    },
  },
  {
    key: 'dvt',
    label: 'DVT',
    render: (data: any) => {
      return (
        <span
          title={data.id}
          className={classNames(css.rowText, css.rowId)}></span>
      );
    },
  },
  {
    key: 'foodPrice',
    label: 'Đơn giá',
    render: (data: any) => {
      return (
        <span title={data.id} className={classNames(css.rowText, css.rowId)}>
          {addCommas(data.foodPrice)} đ
        </span>
      );
    },
  },
];

const ReviewContent: React.FC<any> = (props) => {
  const { restaurant } = props;
  const { restaurantName, phoneNumber, foodList = {} } = restaurant;

  const intl = useIntl();
  const parsedFoodList = Object.keys(foodList).map((key, index) => {
    return {
      key,
      data: {
        id: index + 1,
        foodName: foodList[key].foodName,
        foodPrice: foodList[key].foodPrice,
      },
    };
  }) as any;

  return (
    <div>
      <Collapsible
        label={intl.formatMessage({
          id: 'ReviewOrder.providerLabel',
        })}>
        <div className={classNames(css.contentBox, css.spaceStart)}>
          <div className={css.flexChild}>
            <span className={css.boxTitle}>
              {intl.formatMessage({ id: 'ReviewOrder.providerName' })}
            </span>
            <span className={css.boxContent}>{restaurantName}</span>
          </div>
          <div className={css.flexChild}>
            <span className={css.boxTitle}>
              {intl.formatMessage({ id: 'ReviewOrder.phoneNumberLabel' })}
            </span>
            <span className={css.boxContent}>{phoneNumber}</span>
          </div>
        </div>
      </Collapsible>
      <Collapsible
        label={intl.formatMessage({
          id: 'ReviewOrder.menuLabel',
        })}>
        <Table
          columns={MENU_TABLE_COLUMN}
          data={parsedFoodList}
          tableClassName={css.tableRoot}
          tableHeadClassName={css.tableHead}
          tableBodyClassName={css.tableBody}
          tableBodyRowClassName={css.tableBodyRow}
          tableBodyCellClassName={css.tableBodyCell}
        />
      </Collapsible>
    </div>
  );
};

type TReviewOrder = {
  goBack: () => void;
};

const parseDataToReviewTab = (values: any) => {
  const { orderDetail = {}, ...rest } = values || {};
  const items = Object.keys(orderDetail).map((key: any) => {
    return {
      key,
      label: parseTimestampToFormat(Number(key)),
      childrenFn: (childProps: any) => <ReviewContent {...childProps} />,
      childrenProps: { ...orderDetail[key], ...rest, order: values },
    };
  });
  return items;
};

const ReviewOrder: React.FC<TReviewOrder> = (props) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const orderDetail = useAppSelector(
    (state) => state.Order.orderDetail,
    shallowEqual,
  );
  const order = useAppSelector((state) => state.Order.order, shallowEqual);
  const createOrderError = useAppSelector(
    (state) => state.Order.createOrderError,
  );
  const updateOrderInProgress = useAppSelector(
    (state) => state.Order.updateOrderInProgress,
  );

  const {
    value: isSuccessModalOpen,
    setTrue: openSuccessModal,
    setFalse: closeSuccessModal,
  } = useBoolean();
  useEffect(() => {
    dispatch(orderAsyncActions.fetchOrderDetail(order as TListing));
  }, [dispatch, order]);
  const { staffName, deliveryHour, deliveryAddress, shipperName } = Listing(
    order as TListing,
  ).getMetadata();
  const { address } = deliveryAddress || {};
  const { renderedOrderDetail } =
    useMemo(() => {
      return {
        renderedOrderDetail: parseDataToReviewTab({
          orderDetail,
          deliveryHour,
          deliveryAddress,
        }),
      };
    }, [deliveryAddress, deliveryHour, orderDetail]) || {};

  const onSubmit = async (values: any) => {
    const { staffName: staffNameValue, shipperName: shipperNameValue } = values;
    const { error } = (await dispatch(
      orderAsyncActions.updateOrder({
        generalInfo: {
          staffName: staffNameValue,
          shipperName: shipperNameValue,
        },
      }),
    )) as any;

    if (!error) {
      openSuccessModal();
    }
  };

  const initialValues = useMemo(() => {
    return {
      staffName,
      shipperName,
    };
  }, [staffName, shipperName]);

  return (
    <div className={css.root}>
      <h1 className={css.title}>
        <FormattedMessage id="ReviewOrder.title" />
      </h1>
      <FinalForm
        mutators={{ ...arrayMutators }}
        {...props}
        initialValues={initialValues}
        onSubmit={onSubmit}
        render={(fieldRenderProps: any) => {
          const { handleSubmit, goBack, invalid } = fieldRenderProps;
          return (
            <Form onSubmit={handleSubmit}>
              <Collapsible
                label={intl.formatMessage({ id: 'ReviewOrder.generalInfo' })}>
                <div className={css.contentBox}>
                  <div className={css.flexChild}>
                    <span className={css.boxTitle}>
                      {intl.formatMessage({ id: 'ReviewOrder.deliveryTime' })}
                    </span>
                    <span className={css.boxContent}>{deliveryHour}</span>
                  </div>
                  <div className={css.flexChild}>
                    <span className={css.boxTitle}>
                      {intl.formatMessage({ id: 'ReviewOrder.address' })}
                    </span>
                    <span className={css.boxContent}>{address}</span>
                  </div>
                  <div className={css.flexChild}>
                    <span className={css.boxTitle}>
                      {intl.formatMessage({ id: 'ReviewOrder.staffNameLabel' })}
                    </span>
                    <FieldTextInput
                      className={css.staffInput}
                      name="staffName"
                      id="staffName"
                      placeholder={intl.formatMessage({
                        id: 'ReviewOrder.staffNamePlaceholder',
                      })}
                      validate={required(
                        intl.formatMessage({
                          id: 'ReviewOrder.staffNameRequired',
                        }),
                      )}
                    />
                  </div>
                  <div className={css.flexChild}>
                    <span className={css.boxTitle}>
                      {intl.formatMessage({
                        id: 'ReviewOrder.shipperName.label',
                      })}
                    </span>
                    <FieldTextInput
                      className={css.staffInput}
                      name="shipperName"
                      id="shipperName"
                      placeholder={intl.formatMessage({
                        id: 'ReviewOrder.shipperName.placeholder',
                      })}
                      validate={required(
                        intl.formatMessage({
                          id: 'ReviewOrder.shipperName.required',
                        }),
                      )}
                    />
                  </div>
                </div>
              </Collapsible>
              <Tabs items={renderedOrderDetail as any} showNavigation />
              <NavigateButtons
                goBack={goBack}
                submitDisabled={invalid}
                inProgress={updateOrderInProgress}
              />
              {createOrderError && (
                <div className={css.error}>{createOrderError}</div>
              )}
            </Form>
          );
        }}
      />
      <ConfirmationModal
        id="SuccessOrderModal"
        isOpen={isSuccessModalOpen}
        onClose={closeSuccessModal}
        confirmText={intl.formatMessage({
          id: 'ReviewOrder.successModal.confirmText',
        })}
        title={intl.formatMessage({ id: 'ReviewOrder.successModal.title' })}
        description={intl.formatMessage({
          id: 'ReviewOrder.successModal.description',
        })}
        onConfirm={closeSuccessModal}
      />
    </div>
  );
};

export default ReviewOrder;
