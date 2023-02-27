import type { TDefaultProps, TObject } from '@utils/types';
import classNames from 'classnames';
import isEmpty from 'lodash/isEmpty';
import Link from 'next/link';
import React from 'react';

import css from './NamedLink.module.scss';

type TNameLinkProps = TDefaultProps & {
  passHref?: boolean;
  children?: React.ReactNode;
  params?: TObject<string, string | number | boolean>;
  to?: {
    search: string;
  };
  title?: string;
  path?: string;
  replace?: boolean;
  target?: string;
};

const NamedLink: React.FC<TNameLinkProps> = ({
  className,
  rootClassName,
  passHref,
  children,
  to,
  title,
  path,
  params,
  replace = false,
  target,
}) => {
  const classes = classNames(rootClassName || css.root, className);
  const queryString = to?.search ? `?${to.search}` : '';
  const fullPathName = `${path}${queryString}`;
  const href =
    params && !isEmpty(params)
      ? { pathname: fullPathName, query: params }
      : fullPathName;

  return (
    <Link
      className={classes}
      title={title}
      href={href}
      replace={replace}
      passHref={passHref}
      target={target}>
      {children}
    </Link>
  );
};

export default NamedLink;
