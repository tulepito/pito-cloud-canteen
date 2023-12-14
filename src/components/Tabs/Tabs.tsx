/* eslint-disable react-hooks/exhaustive-deps */
import type { ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';

import type { TButtonProps } from '@components/Button/Button';
import Button from '@components/Button/Button';
import IconArrow from '@components/Icons/IconArrow/IconArrow';

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
  tabItemClassName?: string;
  tabActiveItemClassName?: string;
  disabled?: boolean;
  shouldShowNavigatorBorder?: boolean;
  enableTabScroll?: boolean;
  tabScrollBehavior?: 'auto' | 'smooth';
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
    tabItemClassName,
    tabActiveItemClassName,
    disabled = false,
    shouldShowNavigatorBorder = false,
    enableTabScroll = false,
    tabScrollBehavior = 'smooth',
  } = props;
  const [activeTabKey, setActiveTabKey] = useState(defaultActiveKey || 1);

  const onChangeTab = (tabKey: number) => () => {
    if (disabled) {
      return;
    }
    setActiveTabKey(tabKey);
    onChange(items[Number(tabKey) - 1]);

    if (!enableTabScroll) return;

    const activeTab = document.querySelector(
      `.${classNames(css.tabActive)}`,
    ) as HTMLElement | null;

    if (activeTab) {
      const tabHeaderParent = activeTab.parentElement;

      tabHeaderParent?.scroll({
        left: activeTab.offsetLeft,
        behavior: tabScrollBehavior,
      });
    }
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

  useEffect(() => {
    onChange(items[Number(activeTabKey) - 1]);
  }, [activeTabKey]);

  const tabHeader = items.map((item, index) => {
    const { label } = item;

    const isActiveClass = +activeTabKey === index + 1;

    const tabItemClasses = classNames(
      css.tabHeaderItem,
      {
        [css.tabActive]: isActiveClass,
        [css.tabDisabled]: disabled,
      },
      tabItemClassName,
      {
        [tabActiveItemClassName!]: isActiveClass,
      },
    );

    return (
      <div
        key={`tab-${index}`}
        className={tabItemClasses}
        onClick={onChangeTab(index + 1)}>
        <div
          className={classNames(css.tabItemContent, {
            [css.tabActive]: isActiveClass,
          })}>
          {typeof label === 'function'
            ? label({ ...item, isActive: isActiveClass })
            : label}
        </div>
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
      [css.hasBorder]: shouldShowNavigatorBorder,
    },
    navigationStartClassName,
  );
  const navigationEndClasses = classNames(
    css.navigateBtnEnd,
    {
      [css.middleLabel]: middleLabel,
      [css.hasBorder]: shouldShowNavigatorBorder,
    },
    navigationEndClassName,
  );

  const navButtonProps = {
    variant: 'inline',
    type: 'button',
    className: css.navigateBtn,
  } as Partial<TButtonProps>;

  return (
    <div className={classes}>
      <div className={headerWrapperClasses}>
        {showNavigation && middleLabel && (
          <div className={navigationStartClasses}>
            <Button {...navButtonProps} onClick={goLeft}>
              <IconArrow direction="left" className={css.arrowIcon} />
            </Button>
          </div>
        )}
        <div className={headerClasses}>{tabHeader}</div>
        {showNavigation && (
          <div className={navigationEndClasses}>
            {!middleLabel && (
              <Button {...navButtonProps} onClick={goLeft}>
                <IconArrow direction="left" className={css.arrowIcon} />
              </Button>
            )}
            <Button {...navButtonProps} onClick={goRight}>
              <IconArrow direction="right" className={css.arrowIcon} />
            </Button>
          </div>
        )}
      </div>
      <div className={actionsClasses}>{actionsComponent}</div>
      <div className={contentClasses}>{tabContent}</div>
    </div>
  );
};

export default Tabs;
