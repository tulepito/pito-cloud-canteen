import { type PropsWithChildren, type ReactNode, useEffect } from 'react';
import classNames from 'classnames';

import IconSidebarMenu from '@components/Icons/IconMenu/IconSidebarMenu';
import { useAppDispatch } from '@hooks/reduxHooks';
import { UIActions } from '@redux/slices/UI.slice';

import css from './LayoutSidebar.module.scss';

type TLayoutSidebarProps = PropsWithChildren<{
  className?: string;
  collapse?: boolean;
  logo?: ReactNode;
  onCollapse?: () => void;
}>;

const LayoutSidebar: React.FC<TLayoutSidebarProps> = ({
  className,
  children,
  collapse,
  logo,
  onCollapse,
}) => {
  const dispatch = useAppDispatch();
  const classes = classNames(css.root, className, {
    [css.collapse]: collapse,
  });

  useEffect(() => {
    if (collapse) {
      dispatch(UIActions.disableScrollRequest('sidebar'));
    } else {
      dispatch(UIActions.disableScrollRemove('sidebar'));
    }
  }, [collapse, dispatch]);

  return (
    <div className={classes}>
      <div className={css.header}>
        <div className={css.logo}>
          <div className={css.innerLogo}>{logo}</div>
        </div>
        <IconSidebarMenu onClick={onCollapse} className={css.menuIcon} />
      </div>
      <div className={css.content}>{children}</div>
    </div>
  );
};

export default LayoutSidebar;
