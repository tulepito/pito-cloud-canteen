import FieldTextInput from '@components/FieldTextInput/FieldTextInput';
import Form from '@components/Form/Form';
import type { TColumn } from '@components/Table/Table';
import Table from '@components/Table/Table';
import Tabs from '@components/Tabs/Tabs';
import { getItem } from '@utils/localStorageHelpers';
import { required } from '@utils/validators';
import classNames from 'classnames';
import arrayMutators from 'final-form-arrays';
import { DateTime } from 'luxon';
import React, { useMemo } from 'react';
import { Form as FinalForm } from 'react-final-form';
import { FormattedMessage, useIntl } from 'react-intl';

// eslint-disable-next-line import/no-cycle
import { DRAFT_ORDER_LOCAL_STORAGE_NAME } from '../CreateOrderWizard/CreateOrderWizard';
// eslint-disable-next-line import/no-cycle
import NavigateButtons from '../NavigateButtons/NavigateButtons';
import css from './ReviewOrder.module.scss';

const parseTimestaimpToFormat = (date: number) => {
  return DateTime.fromMillis(date).toFormat('MM-dd-yyyy');
};

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
    label: 'Đơn gía',
    render: (data: any) => {
      return (
        <span title={data.id} className={classNames(css.rowText, css.rowId)}>
          {data.foodPrice}đ
        </span>
      );
    },
  },
];

const MEMBER_ORDER_TABLE_COLUMN: TColumn[] = [
  {
    key: 'stt',
    label: 'STT',
    render: (data: any) => {
      return (
        <span
          title={data.index}
          className={classNames({ [css.parentRow]: data.isParent })}>
          {data.index}
        </span>
      );
    },
  },
  {
    key: 'label',
    label: 'Hạng mục',
    render: (data: any) => {
      return (
        <span
          title={data.index}
          className={classNames({ [css.parentRow]: data.isParent })}>
          {data.label}
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
    key: 'quantity',
    label: 'SL',
    render: (data: any) => {
      return (
        <span title={data.id} className={classNames(css.rowText, css.rowId)}>
          {data.quantity}
        </span>
      );
    },
  },
  {
    key: 'price',
    label: 'Đơn gía',
    render: (data: any) => {
      return (
        <span title={data.id} className={classNames(css.rowText, css.rowId)}>
          {data.price}đ
        </span>
      );
    },
  },
];

const generateOrderDetails = (orders: any[]) => {
  let newData: any[] = [];
  orders.forEach((data: any, index: number) => {
    const { date, memberOrders = {}, foodList = {} } = data;
    const memeberDetails = Object.keys(memberOrders).map(
      (key: any, memberIndex: number) => {
        return {
          key: key + memberIndex + date,
          data: {
            label: foodList[memberOrders[key].foodId]?.foodName || 'Com ga',
            price: foodList[memberOrders[key].foodId]?.foodPrice || 0,
            quantity: 1,
          },
        };
      },
    );

    const totalDatePricing = memeberDetails.reduce((acc, cur) => {
      return cur.data.price + acc;
    }, 0);

    newData.push({
      key: date + index,
      data: {
        isParent: true,
        index: index + 1,
        label: parseTimestaimpToFormat(Number(date)),
        quantity: memeberDetails.length,
        price: totalDatePricing,
      },
    });
    newData = [...newData, ...memeberDetails];
  });

  return newData;
};

const ReviewContent: React.FC<any> = (props) => {
  const {
    foodList,
    deliveryHour,
    deliveryAddress = {},
    restaurantName,
    phoneNumber,
    order,
  } = props;

  const { address } = deliveryAddress;
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

  const { orderDetails = {} } = order;

  const orderDetailsAsArray = Object.keys(orderDetails).map((key) => {
    return {
      date: key,
      ...orderDetails[key],
    };
  }) as any;

  const parsedMemberOrders = generateOrderDetails(orderDetailsAsArray);

  return (
    <div>
      <div className={css.content}>
        <div className={css.generalInfo}>
          <h2 className={css.contentTitle}>
            {intl.formatMessage({ id: 'ReviewOrder.generalInfo' })}
          </h2>
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
                  intl.formatMessage({ id: 'ReviewOrder.staffNameRequired' }),
                )}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={css.content}>
        <div className={css.generalInfo}>
          <h2 className={css.contentTitle}>
            {intl.formatMessage({ id: 'ReviewOrder.providerLabel' })}
          </h2>
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
        </div>
      </div>
      <div className={css.content}>
        <div className={css.generalInfo}>
          <h2 className={css.contentTitle}>
            {intl.formatMessage({ id: 'ReviewOrder.menuLabel' })}
          </h2>
          <Table
            columns={MENU_TABLE_COLUMN}
            data={parsedFoodList}
            tableClassName={css.tableRoot}
            tableHeadClassName={css.tableHead}
            tableBodyClassName={css.tableBody}
            tableBodyRowClassName={css.tableBodyRow}
            tableBodyCellClassName={css.tableBodyCell}
          />
        </div>
      </div>
      <div className={css.content}>
        <div className={css.generalInfo}>
          <h2 className={css.contentTitle}>
            {intl.formatMessage({ id: 'ReviewOrder.memberOrder' })}
          </h2>
          <Table
            columns={MEMBER_ORDER_TABLE_COLUMN}
            data={parsedMemberOrders}
            tableClassName={css.tableRoot}
            tableHeadClassName={classNames(
              css.tableHead,
              css.tableHeadMemberOrder,
            )}
            tableBodyClassName={css.tableBody}
            tableBodyRowClassName={classNames(
              css.tableBodyRow,
              css.tableBodyRowMemberOrder,
            )}
            tableBodyCellClassName={css.tableBodyCell}
          />
        </div>
      </div>
    </div>
  );
};

type TReviewOrder = {
  goBack: () => void;
};

const parseDataToReviewTab = (values: any) => {
  const { orderDetails = {}, generalInfo = {} } = values || {};
  const items = Object.keys(orderDetails).map((key: any) => {
    return {
      key,
      label: parseTimestaimpToFormat(Number(key)),
      childrenFn: (childProps: any) => <ReviewContent {...childProps} />,
      childrenProps: { ...orderDetails[key], ...generalInfo, order: values },
    };
  });
  return items;
};

const ReviewOrder: React.FC<TReviewOrder> = (props) => {
  const { orderDetails } =
    useMemo(() => {
      const order = getItem(DRAFT_ORDER_LOCAL_STORAGE_NAME);
      return {
        orderDetails: parseDataToReviewTab(order),
      };
    }, []) || {};

  const onSubmit = (e: any) => {
    console.log(e);
  };

  return (
    <div className={css.root}>
      <h1 className={css.title}>
        <FormattedMessage id="ReviewOrder.title" />
      </h1>
      <FinalForm
        mutators={{ ...arrayMutators }}
        {...props}
        onSubmit={onSubmit}
        render={(fieldRenderProps: any) => {
          const { handleSubmit, goBack } = fieldRenderProps;
          return (
            <Form onSubmit={handleSubmit}>
              <Tabs items={orderDetails as any} />
              <NavigateButtons goBack={goBack} />
            </Form>
          );
        }}
      />
    </div>
  );
};

export default ReviewOrder;
