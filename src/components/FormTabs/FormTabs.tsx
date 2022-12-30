import FormTabNav from '@components/FormTabNav/FormTabNav';
import classNames from 'classnames';
import type { PropsWithChildren } from 'react';
import React from 'react';

import css from './FormTabs.module.scss';

type TFormTabs = {
  className?: string;
  rootClassName?: string;
  navRootClassName?: string;
  tabRootClassName?: string;
  formTabNavClassName?: string;
};

const FormTabs: React.FC<PropsWithChildren<TFormTabs>> = (props) => {
  const {
    children,
    className,
    rootClassName,
    navRootClassName,
    tabRootClassName,
    formTabNavClassName,
  } = props;
  const rootClasses = rootClassName || css.root;
  const classes = classNames(rootClasses, className);

  const tabNavTabs = React.Children.map(children, (child: any) => {
    const { tabId, tabLabel } = child.props;

    // Child components need to have TabNav props included
    if (!tabId || !tabLabel) {
      throw new Error(
        `Tabs component: a child component is missing required props.
        tabId: (${tabId})
        tabLabel: (${tabLabel})`,
      );
    }

    return {
      id: tabId,
      text: child.props.tabLabel,
      linkProps: child.props.tabLinkProps,
      disabled: child.props.disabled,
      selected: child.props.selected,
      onClick: child.props.onClick,
    };
  });

  const childArray = React.Children.toArray(children);
  const selectedTabPanel = childArray.find((c: any) => c.props.selected);

  // One of the children needs to be selected
  if (!selectedTabPanel) {
    throw new Error(`Tabs component: one Child should have 'selected' prop.`);
  }

  return (
    <div className={classes}>
      <FormTabNav
        rootClassName={navRootClassName}
        tabs={tabNavTabs || []}
        tabRootClassName={tabRootClassName}
        className={formTabNavClassName}
      />
      {selectedTabPanel}
    </div>
  );
};

export default FormTabs;
