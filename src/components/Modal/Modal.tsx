import type { PropsWithChildren, ReactNode } from 'react';
import React, { useEffect } from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';

import Button from '@components/Button/Button';
import IconClose from '@components/Icons/IconClose/IconClose';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useAppDispatch } from '@hooks/reduxHooks';
import { useViewport } from '@hooks/useViewport';
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
  closeButton?: ReactNode;
  handleClose: (e: React.MouseEvent<HTMLElement>) => void;
  modalHeaderClassName?: string;
  scrollLayerClassName?: string;
  customHeader?: ReactNode;
  closeClassName?: string;
  shouldFullScreenInMobile?: boolean;
  shouldHideGreyBackground?: boolean;
  headerClassName?: string;
  modalContainerRef?: React.RefObject<HTMLDivElement>;
}>;

const Modal: React.FC<TModalProps> = (props) => {
  const {
    id,
    children,
    isOpen,
    title,
    shouldHideIconClose = false,
    className,
    containerClassName,
    contentClassName,
    openClassName,
    handleClose,
    scrollLayerClassName,
    customHeader,
    closeButton,
    closeClassName,
    shouldFullScreenInMobile = true,
    shouldHideGreyBackground = false,
    headerClassName,
    modalContainerRef,
  } = props;

  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { isTabletLayoutOrLarger } = useViewport();
  const closeModalClasses = closeClassName || css.isClosed;
  const isOpenClass = isOpen
    ? classNames(css.isOpen, openClassName)
    : closeModalClasses;
  const classes = classNames(isOpenClass, className);
  const containerClasses = classNames(
    css.container,
    {
      [css.fullScreenInMobile]:
        shouldFullScreenInMobile && !isTabletLayoutOrLarger,
    },
    containerClassName,
  );
  const scrollLayerClasses = classNames(
    css.scrollLayer,
    {
      [css.fullScreenInMobile]:
        shouldFullScreenInMobile && !isTabletLayoutOrLarger,
      [css.hideGreyBackground]: shouldHideGreyBackground,
    },
    scrollLayerClassName,
  );

  const headerClasses = classNames(headerClassName, css.modalHeader);

  const hasTitle = !!title;
  const closeModalMessage = intl.formatMessage({ id: 'Modal.closeModal' });

  const closeBtn =
    !shouldHideIconClose && isOpen
      ? closeButton || (
          <Button
            onClick={handleClose}
            rootClassName={css.close}
            title={closeModalMessage}>
            <IconClose rootClassName={css.closeIcon} />
          </Button>
        )
      : null;

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
        <div ref={modalContainerRef} className={containerClasses}>
          <RenderWhen
            condition={!customHeader && (!shouldHideIconClose || hasTitle)}>
            <div className={headerClasses}>
              {closeBtn}
              {hasTitle && <div className={css.title}>{title}</div>}
            </div>
            <RenderWhen.False>{customHeader}</RenderWhen.False>
          </RenderWhen>

          <div className={contentClassName}>{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
