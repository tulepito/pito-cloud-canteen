import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';

import type { TDefaultProps } from '@utils/types';

import PartnerLayoutContent from '../PartnerLayoutContent/PartnerLayoutContent';
import PartnerLayoutSidebar from '../PartnerLayoutSidebar/PartnerLayoutSidebar';
import PartnerLayoutTopbar from '../PartnerLayoutTopbar/PartnerLayoutTopbar';

import css from './PartnerLayoutWrapper.module.scss';

const prepareChildren = (children: ReactElement[]) => {
  const childrenCount = React.Children.count(children);
  if (!(childrenCount === 2 || childrenCount === 3)) {
    throw new Error(
      `PartnerLayoutWrapper needs to have 2 - 3 children:
      PartnerLayoutTopbar, PartnerLayoutContent.`,
    );
  }

  const childrenMap = {} as any;

  React.Children.forEach(children, (child: ReactElement) => {
    if (child.type === PartnerLayoutTopbar) {
      childrenMap.layoutWrapperTopbar = child;
    } else if (child.type === PartnerLayoutSidebar) {
      childrenMap.layoutWrapperSidebar = child;
    } else if (child.type === PartnerLayoutContent) {
      // LayoutWrapperMain needs different rootClassName
      const childWithAddedCSS = React.cloneElement(child, {
        rootClassName: css.layoutWrapperMain,
      });
      childrenMap.layoutWrapperMain = childWithAddedCSS;
    } else {
      throw new Error(
        `PartnerLayoutWrapper has an unknown child.
      Only PartnerLayoutTopbar ,PartnerLayoutContent are allowed.`,
      );
    }
  });

  return childrenMap;
};

type TPartnerLayoutWrapperProps = TDefaultProps & {
  children: ReactElement[];
};

const PartnerLayoutWrapper = (props: TPartnerLayoutWrapperProps) => {
  const { className, children, rootClassName } = props;
  const preparedChildren = prepareChildren(children);
  const classes = classNames(rootClassName || css.root, className);
  const maybeFooter = preparedChildren.layoutWrapperFooter || null;

  return (
    <div className={classes}>
      {preparedChildren.layoutWrapperSidebar}
      <div className={css.main}>
        {preparedChildren.layoutWrapperTopbar}
        {preparedChildren.layoutWrapperMain}
      </div>
      {maybeFooter}
    </div>
  );
};

export default PartnerLayoutWrapper;
