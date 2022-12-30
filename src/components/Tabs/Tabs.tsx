import classNames from 'classnames';
import type { ReactNode } from 'react';
import React, { useState } from 'react';
import { FieldArray } from 'react-final-form-arrays';

import css from './Tabs.module.scss';

export type TTabsItem = {
  label: string;
  key: string;
  children: ReactNode | string | number;
};
interface ITabsProps {
  defaultActiveKey?: string;
  items: TTabsItem[];
  onChange?: () => void;
}

const Tabs = (props: ITabsProps) => {
  const { defaultActiveKey, items } = props;
  const [activeTabKey, setActiveTabKey] = useState(defaultActiveKey || 1);

  const onChangeTab = (tabKey: number) => {
    setActiveTabKey(tabKey);
  };

  const tabHeader = items.map((item, index) => {
    const { label } = item;

    const isActiveClass = +activeTabKey === index + 1;

    const tabItemClasses = classNames(css.tabHeaderItem, {
      [css.tabActive]: isActiveClass,
    });
    return (
      <div
        key={`tab-${index}`}
        className={tabItemClasses}
        onClick={() => onChangeTab(index + 1)}>
        <span
          className={classNames(css.tabItemContent, {
            [css.tabActive]: isActiveClass,
          })}>
          {label}
        </span>
      </div>
    );
  });

  const tabContent = items[+activeTabKey - 1]?.children || '';

  // classes setup
  const headerClassName = classNames(css.tabHeaders);
  const contentClassName = classNames(css.tabPanel);
  return (
    <div>
      <div className={headerClassName}>{tabHeader}</div>
      <div className={contentClassName}>{tabContent}</div>
    </div>
  );
};

export type TTabFieldItem = {
  label: string;
  key: string;
  children: (e: any) => ReactNode;
  childrenProps: any;
};

export type TTabFieldProps = {
  defaultActiveKey?: string;
  items: TTabFieldItem[];
  name: string;
  id?: string;
  onChange?: () => void;
};

export const TabFields = (props: TTabFieldProps) => {
  const { defaultActiveKey, name, items, id } = props;
  const [activeTabKey, setActiveTabKey] = useState(defaultActiveKey || 1);

  const onChangeTab = (tabKey: number) => {
    setActiveTabKey(tabKey);
  };

  const tabHeader = items.map((item, index) => {
    const { label } = item;

    const isActiveClass = +activeTabKey === index + 1;

    const tabItemClasses = classNames(css.tabHeaderItem, {
      [css.tabActive]: isActiveClass,
    });
    return (
      <div
        key={`tab-${index}`}
        className={tabItemClasses}
        onClick={() => onChangeTab(index + 1)}>
        <span
          className={classNames(css.tabItemContent, {
            [css.tabActive]: isActiveClass,
          })}>
          {label}
        </span>
      </div>
    );
  });

  const childrenProps = items[+activeTabKey - 1]?.childrenProps;

  const tabContent = items[+activeTabKey - 1]?.children || '';

  // classes setup
  const headerClassName = classNames(css.tabHeaders);
  const contentClassName = classNames(css.tabPanel);
  return (
    <div className={css.tabFields}>
      <div className={headerClassName}>{tabHeader}</div>
      <FieldArray name={name} id={id}>
        {({ fields }) => {
          return fields.map((fieldName, index) => {
            return (
              index === +activeTabKey - 1 && (
                <div key={name} className={contentClassName}>
                  {tabContent({ ...childrenProps, name: fieldName })}
                </div>
              )
            );
          });
        }}
      </FieldArray>
    </div>
  );
};

export default Tabs;
