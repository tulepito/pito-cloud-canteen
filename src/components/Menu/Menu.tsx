import type { PropsWithChildren, ReactNode } from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import isEmpty from 'lodash/isEmpty';

import RenderWhen from '@components/RenderWhen/RenderWhen';
import type { TDefaultProps } from '@src/utils/types';

import css from './Menu.module.scss';

type TMenuItemProps = TDefaultProps & {
  onClick?: () => void;
  label?: ReactNode;
  labelId?: string;
  disabled?: boolean;
};

export const MenuItem: React.FC<TMenuItemProps> = ({
  rootClassName,
  className,
  label,
  labelId,
  disabled = false,
  onClick = () => {},
}) => {
  const rootClasses = classNames(
    rootClassName || css.itemRoot,
    { [css.itemDisabled]: disabled },
    className,
  );

  const intl = useIntl();

  return (
    <div className={rootClasses} onClick={onClick}>
      <RenderWhen condition={!isEmpty(labelId)}>
        {intl.formatMessage({ id: labelId })}

        <RenderWhen.False>{label}</RenderWhen.False>
      </RenderWhen>
    </div>
  );
};

type TMenuProps = {} & PropsWithChildren;

export const Menu: React.FC<TMenuProps> = ({ children }) => {
  return <div className={css.root}>{children}</div>;
};
