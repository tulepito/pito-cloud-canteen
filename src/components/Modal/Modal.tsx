import Button from '@components/Button/Button';
import IconClose from '@components/Icons/IconClose/IconClose';
import useLockBodyScroll from '@hooks/useDisableBodyScroll';
import classNames from 'classnames';
import type { PropsWithChildren, ReactNode } from 'react';
import React from 'react';
import { useIntl } from 'react-intl';

import css from './Modal.module.scss';

type TModalProps = PropsWithChildren<{
  className?: string;
  containerClassName?: string;
  contentClassName?: string;
  isOpen: boolean;
  title?: ReactNode | string;
  shouldHideIconClose?: boolean;
  handleClose: () => void;
  scrollLayerClassName?: string;
  customHeader?: ReactNode;
}>;

const Modal: React.FC<TModalProps> = (props) => {
  const {
    children,
    isOpen,
    title,
    shouldHideIconClose,
    className,
    containerClassName,
    contentClassName,
    handleClose,
    scrollLayerClassName,
    customHeader,
  } = props;

  const intl = useIntl();
  const isOpenClass = isOpen ? css.isOpen : css.isClosed;
  const classes = classNames(isOpenClass, className);
  const containerClasses = classNames(css.container, containerClassName);
  const scrollLayerClasses = scrollLayerClassName || css.scrollLayer;
  const hasTitle = !!title;
  const closeModalMessage = intl.formatMessage({ id: 'Modal.closeModal' });

  useLockBodyScroll({ isOpen });

  const closeBtn =
    !shouldHideIconClose && isOpen ? (
      <Button
        onClick={handleClose}
        rootClassName={css.close}
        title={closeModalMessage}>
        <IconClose rootClassName={css.closeIcon} />
      </Button>
    ) : null;

  return (
    <div className={classes}>
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
