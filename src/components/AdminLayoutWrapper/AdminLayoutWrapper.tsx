/**
 * LayoutSingleColumn needs to have 2-3 children:
 * LayoutWrapperTopbar, LayoutWrapperMain, and possibly LayoutWrapperFooter.
 */
import AdminLayoutContent from '@components/AdminLayoutContent/AdminLayoutContent';
import AdminLayoutSidebar from '@components/AdminLayoutSidebar/AdminLayoutSidebar';
import AdminLayoutTopbar from '@components/AdminLayoutTopbar/AdminLayoutTopbar';
import classNames from 'classnames';
import React from 'react';

import css from './AdminLayoutWrapper.module.scss';

const prepareChildren = (children: any) => {
  const childrenCount = React.Children.count(children);
  if (!(childrenCount === 2 || childrenCount === 3)) {
    throw new Error(
      `AdminLayoutWrapper needs to have 2 - 3 children:
      AdminLayoutTopbar ,AdminLayoutContent.`,
    );
  }

  const childrenMap = {} as any;
  console.log({ children });
  React.Children.forEach(children, (child) => {
    if (child.type === AdminLayoutTopbar) {
      childrenMap.layoutWrapperTopbar = child;
    } else if (child.type === AdminLayoutSidebar) {
      childrenMap.layoutWrapperSiderbar = child;
    } else if (child.type === AdminLayoutContent) {
      // LayoutWrapperMain needs different rootClassName
      const childWithAddedCSS = React.cloneElement(child, {
        rootClassName: css.layoutWrapperMain,
      });
      childrenMap.layoutWrapperMain = childWithAddedCSS;
    } else {
      throw new Error(
        `AdminLayoutWrapper has an unknown child.
      Only AdminLayoutTopbar ,AdminLayoutContent are allowed.`,
      );
    }
  });
  return childrenMap;
};

const AdminLayoutWrapper = (props: any) => {
  const { className, rootClassName, children } = props;
  const preparedChildren = prepareChildren(children);
  const classes = classNames(rootClassName || css.root, className);
  const maybeFooter = preparedChildren.layoutWrapperFooter || null;

  return (
    <div className={classes}>
      {preparedChildren.layoutWrapperSiderbar}
      <div className={css.main}>
        {preparedChildren.layoutWrapperTopbar}
        {preparedChildren.layoutWrapperMain}
      </div>
      {maybeFooter}
    </div>
  );
};

export default AdminLayoutWrapper;
