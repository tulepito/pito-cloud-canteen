import Button from '@components/Button/Button';
import IconClose from '@components/IconClose/IconClose';
import classNames from 'classnames';
import type { ReactNode } from 'react';
import React from 'react';
import { useIntl } from 'react-intl';

import css from './Modal.module.scss';

type TModal = {
  children?: ReactNode;
  isOpen: boolean;
  title?: string;
  shouldHideIconClose?: boolean;
  containerClassName?: string;
  className?: string;
  contentClassName?: string;
  handleClose: () => void;
  scrollLayerClassName?: string;
};

const Modal = (props: TModal) => {
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
  } = props;

  const intl = useIntl();
  const isOpenClass = isOpen ? css.isOpen : css.isClosed;
  const classes = classNames(isOpenClass, className);
  const containerClasses = containerClassName || css.container;
  const scrollLayerClasses = scrollLayerClassName || css.scrollLayer;
  const hasTitle = title && title.length > 0;
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

  return (
    <div className={classes}>
      <div className={scrollLayerClasses}>
        <div className={containerClasses}>
          <div className={css.modalHeader}>
            {hasTitle && (
              <div className={css.title}>
                <span>{title}</span>
              </div>
            )}
            {closeBtn}
          </div>
          <div className={classNames(contentClassName || css.content)}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
