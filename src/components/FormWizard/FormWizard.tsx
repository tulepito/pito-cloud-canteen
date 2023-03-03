import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';

import FormTabs from './FormTabs/FormTabs';

import css from './FormWizard.module.scss';

type TFormWizardProps = {
  className?: string;
  formTabNavClassName?: string;
  children: ReactElement[];
};

const FormWizard: React.FC<TFormWizardProps> = (props) => {
  const { className, children, formTabNavClassName } = props;
  const classes = classNames(css.root, className);
  return (
    <div className={classes}>
      <FormTabs
        rootClassName={css.tabsContainer}
        navRootClassName={css.nav}
        formTabNavClassName={formTabNavClassName}
        tabRootClassName={css.tab}>
        {children}
      </FormTabs>
    </div>
  );
};

export default FormWizard;
