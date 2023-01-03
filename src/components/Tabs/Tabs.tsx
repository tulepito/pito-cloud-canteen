import { InlineTextButton } from '@components/Button/Button';
import IconArrow from '@components/IconArrow/IconArrow';
import classNames from 'classnames';
import type { ReactNode } from 'react';
import React, { useState } from 'react';

import css from './Tabs.module.scss';

export type TTabsItem = {
  label: string;
  key: string;
  children?: ReactNode | string | number;
  childrenFn?: (e: any) => ReactNode;
  childrenProps?: any;
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

  const goLeft = () => {
    if (activeTabKey === 1) {
      return;
    }
    setActiveTabKey(+activeTabKey - 1);
  };

  const goRight = () => {
    if (activeTabKey === items.length) {
      return;
    }
    setActiveTabKey(+activeTabKey + 1);
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

  const activeItem = items[+activeTabKey - 1];

  const tabContent =
    activeItem && activeItem.childrenFn
      ? activeItem?.childrenFn(activeItem?.childrenProps)
      : activeItem?.children || '';

  // classes setup
  const headerClassName = classNames(css.tabHeaders);
  const contentClassName = classNames(css.tabPanel);
  return (
    <div>
      <div className={css.tabHeaderWrapper}>
        <div className={headerClassName}>{tabHeader}</div>
        <div className={css.navigateBtn}>
          <InlineTextButton type="button" onClick={goLeft}>
            <IconArrow direction="left" />
          </InlineTextButton>
          <InlineTextButton type="button" onClick={goRight}>
            <IconArrow direction="right" />
          </InlineTextButton>
        </div>
      </div>
      <div className={contentClassName}>{tabContent}</div>
    </div>
  );
};

export default Tabs;
