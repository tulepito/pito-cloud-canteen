import classNames from 'classnames';
import Link from 'next/link';
import React from 'react';

import css from './NamedLink.module.scss';

type TNameLinkProps = {
  className?: string;
  rootClassName?: string;
  passHref?: boolean;
  children?: React.ReactNode;
  params?: { [name: string]: string | number | boolean };
  to?: {
    search: string;
  };
  title?: string;
  path?: string;
  replace?: boolean;
};

const NamedLink: React.FC<TNameLinkProps> = ({
  className,
  rootClassName,
  passHref,
  children,
  to,
  title,
  path,
  replace = false,
}) => {
  const queryString = to?.search ? `?${to.search}` : '';

  const classes = classNames(rootClassName || css.root, className);

  return (
    <Link
      className={classes}
      title={title}
      href={`${path}${queryString}`}
      replace={replace}
      passHref={passHref}>
      {children}
    </Link>
  );
};

export default NamedLink;
