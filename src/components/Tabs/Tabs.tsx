import { InlineTextButton } from '@components/Button/Button';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import classNames from 'classnames';
import type { ReactNode } from 'react';
import React, { useEffect, useState } from 'react';

import css from './Tabs.module.scss';

export type TTabsItem = {
  label:
    | ((e: TTabsItem & { isActive?: boolean }) => ReactNode)
    | string
    | ReactNode;
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
  middleLabel?: boolean;
  actionsClassName?: string;
  actionsComponent?: ReactNode;
  headerWrapperClassName?: string;
  className?: string;
  navigationStartClassName?: string;
  navigationEndClassName?: string;
};

const Tabs: React.FC<ITabsProps> = (props) => {
  const {
    defaultActiveKey,
    items,
    contentClassName,
    headerClassName,
    actionsClassName,
    onChange = () => null,
    showNavigation = false,
    actionsComponent,
    headerWrapperClassName,
    className,
    middleLabel,
    navigationStartClassName,
    navigationEndClassName,
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
          {typeof label === 'function'
            ? label({ ...item, isActive: isActiveClass })
            : label}
        </span>
      </div>
    );
  });

  const activeItem = items[+activeTabKey - 1];

  const tabContent =
    activeItem && activeItem.childrenFn
      ? activeItem?.childrenFn({
          id: activeItem.id,
          ...activeItem?.childrenProps,
        })
      : activeItem?.children || '';

  // classes setup
  const headerClasses = classNames(css.tabHeaders, headerClassName);
  const actionsClasses = classNames(css.actions, actionsClassName);
  const contentClasses = classNames(css.tabPanel, contentClassName);
  const headerWrapperClasses = classNames(
    css.headerWrapper,
    headerWrapperClassName,
  );
  const classes = classNames(css.root, className);
  const navigationStartClasses = classNames(
    css.navigateBtnStart,
    {
      [css.middleLabel]: middleLabel,
    },
    navigationStartClassName,
  );
  const navigationEndClasses = classNames(
    css.navigateBtnEnd,
    {
      [css.middleLabel]: middleLabel,
    },
    navigationEndClassName,
  );

  return (
    <div className={classes}>
      <div className={headerWrapperClasses}>
        {showNavigation && middleLabel && (
          <div className={navigationStartClasses}>
            <InlineTextButton type="button" onClick={goLeft}>
              <IconArrow direction="left" />
            </InlineTextButton>
          </div>
        )}
        <div className={headerClasses}>{tabHeader}</div>
        {showNavigation && (
          <div className={navigationEndClasses}>
            {!middleLabel && (
              <InlineTextButton type="button" onClick={goLeft}>
                <IconArrow direction="left" />
              </InlineTextButton>
            )}
            <InlineTextButton type="button" onClick={goRight}>
              <IconArrow direction="right" />
            </InlineTextButton>
          </div>
        )}
      </div>
      <div className={actionsClasses}>{actionsComponent}</div>
      <div className={contentClasses}>{tabContent}</div>
    </div>
  );
};

export default Tabs;
