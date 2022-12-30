import FieldTextInput from '@components/FieldTextInput/FieldTextInput';
import Form from '@components/Form/Form';
import type { TColumn } from '@components/Table/Table';
import Table from '@components/Table/Table';
import { TabFields } from '@components/Tabs/Tabs';
import classNames from 'classnames';
import arrayMutators from 'final-form-arrays';
import { DateTime } from 'luxon';
import React, { useMemo } from 'react';
import { Field, Form as FinalForm } from 'react-final-form';
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
    key: 'category',
    label: 'Hạng mục',
    render: (data: any) => {
      return (
        <span title={data.id} className={classNames(css.rowText, css.rowId)}>
          {data.id}
        </span>
      );
    },
  },
  {
    key: 'dvt',
    label: 'DVT',
    render: (data: any) => {
      return (
        <span title={data.id} className={classNames(css.rowText, css.rowId)}>
          {data.id}
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
          {data.id}
        </span>
      );
    },
  },
];

const ReviewContent: React.FC<any> = (props) => {
  const { name, id, ...rest } = props;
  console.log(rest);
  const data = [
    {
      key: 1,
      data: { id: 1, category: 'Cơm rang', dvt: 'Test', price: 60000 },
    },
    {
      key: 2,
      data: { id: 1, category: 'Cơm rang', dvt: 'Test', price: 60000 },
    },
    {
      key: 3,
      data: { id: 1, category: 'Cơm rang', dvt: 'Test', price: 60000 },
    },
    {
      key: 4,
      data: { id: 1, category: 'Cơm rang', dvt: 'Test', price: 60000 },
    },
  ];
  return (
    <div>
      <Field name={name} id={id}>
        {(field) => {
          console.log(field);
          return (
            <div className={css.content}>
              <div className={css.generalInfo}>
                <h2 className={css.contentTitle}>Thông tin chung</h2>
                <div className={css.contentBox}>
                  <div className={css.flexChild}>
                    <span className={css.boxTitle}>Thời gian giao hàng</span>
                    <span className={css.boxContent}>10:00 - 11:00</span>
                  </div>
                  <div className={css.flexChild}>
                    <span className={css.boxTitle}>Địa chỉ</span>
                    <span className={css.boxContent}>
                      123 Trần Huy Liệu, quận 2, tp Hồ Chí Minh
                    </span>
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
          );
        }}
      </Field>

      <div className={css.content}>
        <div className={css.generalInfo}>
          <h2 className={css.contentTitle}>Nhà cung cấp</h2>
          <div className={classNames(css.contentBox, css.spaceStart)}>
            <div className={css.flexChild}>
              <span className={css.boxTitle}>Tên nhà cung cấp</span>
              <span className={css.boxContent}>Nhà hàng 1</span>
            </div>
            <div className={css.flexChild}>
              <span className={css.boxTitle}>Số điện thoại liên hệ</span>
              <span className={css.boxContent}>0962448869</span>
            </div>
          </div>
        </div>
      </div>
      <div className={css.content}>
        <div className={css.generalInfo}>
          <h2 className={css.contentTitle}>Thực đơn</h2>
          <Table
            columns={TABLE_COLUMN}
            data={data}
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
  const { orderDetails } = values || {};
  const items = Object.keys(orderDetails).map((key: any) => {
    return {
      key,
      label: DateTime.fromMillis(Number(key)).toFormat('MM-dd-yyyy'),
      children: (childProps: any) => <ReviewContent {...childProps} />,
      childrenProps: orderDetails[key],
    };
  });
  return items;
};

const ReviewOrder: React.FC<TReviewOrder> = (props) => {
  const initialValues = useMemo(() => {
    const windowVariable = window as any;
    const order = JSON.parse(
      windowVariable?.localStorage.getItem('draftOrder'),
    );
    return {
      orderDetails: parseDataToReviewTab(order),
    };
  }, []);

  const onSubmit = () => {};

  return (
    <div className={css.root}>
      <h1 className={css.title}>
        <FormattedMessage id="ReviewOrder.title" />
      </h1>
      <FinalForm
        mutators={{ ...arrayMutators }}
        initialValues={initialValues}
        {...props}
        onSubmit={onSubmit}
        render={(fieldRenderProps: any) => {
          const { handleSubmit, goBack } = fieldRenderProps;
          return (
            <Form onSubmit={handleSubmit}>
              <TabFields
                name="orderDetails"
                id="orderDetails"
                items={initialValues.orderDetails as any}
              />
              <NavigateButtons goBack={goBack} />
            </Form>
          );
        }}
      />
    </div>
  );
};

export default ReviewOrder;
