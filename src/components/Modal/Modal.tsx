import type { PropsWithChildren, ReactNode } from 'react';
import React, { useEffect } from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';

import Button from '@components/Button/Button';
import IconClose from '@components/Icons/IconClose/IconClose';
import { useAppDispatch } from '@hooks/reduxHooks';
import { UIActions } from '@redux/slices/UI.slice';

import css from './Modal.module.scss';

export type TModalProps = PropsWithChildren<{
  id?: string;
  className?: string;
  containerClassName?: string;
  contentClassName?: string;
  openClassName?: string;
  isOpen: boolean;
  title?: ReactNode | string;
  shouldHideIconClose?: boolean;
  handleClose: () => void;
  scrollLayerClassName?: string;
  customHeader?: ReactNode;
}>;

const Modal: React.FC<TModalProps> = (props) => {
  const {
    id,
    children,
    isOpen,
    title,
    shouldHideIconClose,
    className,
    containerClassName,
    contentClassName,
    openClassName,
    handleClose,
    scrollLayerClassName,
    customHeader,
  } = props;

  const intl = useIntl();
  const dispatch = useAppDispatch();
  const isOpenClass = isOpen
    ? classNames(css.isOpen, openClassName)
    : css.isClosed;
  const classes = classNames(isOpenClass, className);
  const containerClasses = classNames(css.container, containerClassName);
  const scrollLayerClasses = classNames(css.scrollLayer, scrollLayerClassName);
  const hasTitle = !!title;
  const closeModalMessage = intl.formatMessage({ id: 'Modal.closeModal' });

  const closeBtn =
    !shouldHideIconClose && isOpen ? (
      <Button
        onClick={handleClose}
        rootClassName={css.close}
        title={closeModalMessage}>
        <IconClose rootClassName={css.closeIcon} />
      </Button>
    ) : null;

  useEffect(() => {
    if (isOpen) {
      dispatch(UIActions.disableScrollRequest(id));
    }

    return () => {
      dispatch(UIActions.disableScrollRemove(id));
    };
  }, [dispatch, id, isOpen]);

  return (
    <div id={id} className={classes}>
      <div className={scrollLayerClasses}>
        <div className={containerClasses}>
          {!customHeader && (
            <div className={css.modalHeader}>
              {hasTitle && <div className={css.title}>{title}</div>}
              {closeBtn}
            </div>
          )}
          {customHeader}
          <div className={classNames(contentClassName || css.content)}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
