import { InlineTextButton } from '@components/Button/Button';
import IconArrow from '@components/IconArrow/IconArrow';
import classNames from 'classnames';
import type { ReactNode } from 'react';
import React, { useEffect, useState } from 'react';

import css from './Tabs.module.scss';

type TTabsItem = {
  label: ReactNode;
  id: string | number;
  children: ReactNode | string | number;
  childrenFn?: (e: any) => ReactNode;
  childrenProps?: any;
};

type ITabsProps = {
  defaultActiveKey?: string;
  items: TTabsItem[];
  onChange?: (params: any) => void;
  contentClassName?: string;
  headerClassName?: string;
  showNavigation?: boolean;
};

const Tabs: React.FC<ITabsProps> = (props) => {
  const {
    defaultActiveKey,
    items,
    contentClassName,
    headerClassName,
    onChange = () => null,
    showNavigation = false,
  } = props;
  const [activeTabKey, setActiveTabKey] = useState(defaultActiveKey || 1);

  const onChangeTab = (tabKey: number) => () => {
    setActiveTabKey(tabKey);
    onChange(items[Number(tabKey) - 1]);
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
  useEffect(() => {
    onChangeTab(Number(defaultActiveKey || 1))();
  }, [defaultActiveKey]);

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
        onClick={onChangeTab(index + 1)}>
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
  const headerClasses = classNames(css.tabHeaders, headerClassName);
  const contentClasses = classNames(css.tabPanel, contentClassName);
  return (
    <div className={showNavigation ? css.tabHeaderWrapper : css.root}>
      <div className={headerClasses}>{tabHeader}</div>
      <div className={contentClasses}>{tabContent}</div>
      {showNavigation && (
        <div className={css.navigateBtn}>
          <InlineTextButton type="button" onClick={goLeft}>
            <IconArrow direction="left" />
          </InlineTextButton>
          <InlineTextButton type="button" onClick={goRight}>
            <IconArrow direction="right" />
          </InlineTextButton>
        </div>
      )}
    </div>
  );
};

export default Tabs;
