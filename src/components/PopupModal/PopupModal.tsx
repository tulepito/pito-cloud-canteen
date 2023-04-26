import { useEffect } from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';

import Button from '@components/Button/Button';
import IconClose from '@components/Icons/IconClose/IconClose';
import type { TModalProps } from '@components/Modal/Modal';
import { useAppDispatch } from '@hooks/reduxHooks';
import { UIActions } from '@redux/slices/UI.slice';

import css from './PopupModal.module.scss';

type PopupModalProps = TModalProps & {};

const PopupModal: React.FC<PopupModalProps> = (props) => {
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
    closeClassName,
  } = props;
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const closeModalClasses = closeClassName || css.isClosed;
  const isOpenClass = isOpen
    ? classNames(css.isOpen, openClassName)
    : closeModalClasses;
  const classes = classNames(isOpenClass, className);
  const containerClasses = classNames(css.container, containerClassName);
  const scrollLayerClasses = classNames(css.scrollLayer, scrollLayerClassName);
  const contentClasses = classNames(css.content, contentClassName);
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
          <div className={contentClasses}>{children}</div>
        </div>
      </div>
    </div>
  );
};

export default PopupModal;
