import FieldTextInput from '@components/FieldTextInput/FieldTextInput';
import Form from '@components/Form/Form';
import type { TColumn } from '@components/Table/Table';
import Table from '@components/Table/Table';
import Tabs from '@components/Tabs/Tabs';
import { getItem } from '@utils/localStorageHelpers';
import classNames from 'classnames';
import arrayMutators from 'final-form-arrays';
import { DateTime } from 'luxon';
import React, { useMemo } from 'react';
import { Form as FinalForm } from 'react-final-form';
import { FormattedMessage } from 'react-intl';

import NavigateButtons from '../NavigateButtons/NavigateButtons';
import css from './ReviewOrder.module.scss';

const TABLE_COLUMN: TColumn[] = [
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

const ReviewContent: React.FC<any> = (props) => {
  const {
    foodList,
    deliveryHour,
    deliveryAddress,
    restaurantName,
    phoneNumber,
  } = props;
  const { address } = deliveryAddress;

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
      <div className={css.content}>
        <div className={css.generalInfo}>
          <h2 className={css.contentTitle}>Thông tin chung</h2>
          <div className={css.contentBox}>
            <div className={css.flexChild}>
              <span className={css.boxTitle}>Thời gian giao hàng</span>
              <span className={css.boxContent}>{deliveryHour}</span>
            </div>
            <div className={css.flexChild}>
              <span className={css.boxTitle}>Địa chỉ</span>
              <span className={css.boxContent}>{address}</span>
            </div>
            <div className={css.flexChild}>
              <span className={css.boxTitle}>Nhân viên phụ trách</span>
              <FieldTextInput
                className={css.staffInput}
                name="staff"
                id="staff"
                placeholder="Nhập tên"
              />
            </div>
          </div>
        </div>
      </div>

      <div className={css.content}>
        <div className={css.generalInfo}>
          <h2 className={css.contentTitle}>Nhà cung cấp</h2>
          <div className={classNames(css.contentBox, css.spaceStart)}>
            <div className={css.flexChild}>
              <span className={css.boxTitle}>Tên nhà cung cấp</span>
              <span className={css.boxContent}>{restaurantName}</span>
            </div>
            <div className={css.flexChild}>
              <span className={css.boxTitle}>Số điện thoại liên hệ</span>
              <span className={css.boxContent}>{phoneNumber}</span>
            </div>
          </div>
        </div>
      </div>
      <div className={css.content}>
        <div className={css.generalInfo}>
          <h2 className={css.contentTitle}>Thực đơn</h2>
          <Table
            columns={TABLE_COLUMN}
            data={parsedFoodList}
            tableClassName={css.tableRoot}
            tableHeadClassName={css.tableHead}
            tableBodyClassName={css.tableBody}
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
  const { orderDetails, generalInfo } = values || {};
  const items = Object.keys(orderDetails).map((key: any) => {
    return {
      key,
      label: DateTime.fromMillis(Number(key)).toFormat('MM-dd-yyyy'),
      childrenFn: (childProps: any) => <ReviewContent {...childProps} />,
      childrenProps: { ...orderDetails[key], ...generalInfo },
    };
  });
  return items;
};

const ReviewOrder: React.FC<TReviewOrder> = (props) => {
  const { orderDetails } =
    useMemo(() => {
      const order = getItem('draftOrder');
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
