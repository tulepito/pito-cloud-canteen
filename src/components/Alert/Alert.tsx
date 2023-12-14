import type { ReactNode } from 'react';
import { useEffect } from 'react';
import classNames from 'classnames';

import IconClose from '@components/Icons/IconClose/IconClose';
import IconTickWithBackground from '@components/Icons/IconTickWithBackground/IconTickWithBackground';
import IconWarningWithTriangle from '@components/Icons/IconWarningWithTriangle/IconWarningWithTriangle';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import type { TDefaultProps } from '@src/utils/types';

import css from './Alert.module.scss';

const DEFAULT_CLOSE_TIME = 2000;

export enum EAlertPosition {
  bottom = 'bottom',
  topRight = 'topRight',
  topLeft = 'topLeft',
  bottomRight = 'bottomRight',
  bottomLeft = 'bottomLeft',
}

export enum EAlertType {
  warning = 'warning',
  success = 'success',
}

type TAlertProps = TDefaultProps & {
  position?: EAlertPosition;
  type?: EAlertType;
  message: string;
  messageClassName?: string;
  hasCloseButton?: boolean;
  onClose: () => void;
  autoClose?: boolean;
  timeToClose?: number;
  isOpen: boolean;
  openClassName?: string;
  containerClassName?: string;
  customIcon?: ReactNode;
};

const Alert: React.FC<TAlertProps> = (props) => {
  const {
    isOpen = true,
    openClassName,
    message,
    messageClassName,
    className,
    containerClassName,
    position = EAlertPosition.topRight,
    type = EAlertType.warning,
    hasCloseButton = true,
    onClose,
    autoClose = true,
    timeToClose = DEFAULT_CLOSE_TIME,
    customIcon,
  } = props;

  const rootClasses = classNames(
    css.root,
    {
      [css.isOpen]: isOpen,
      [css.rightSide]:
        position === EAlertPosition.topRight ||
        position === EAlertPosition.bottomRight,
      [css.leftSide]:
        position === EAlertPosition.topLeft ||
        position === EAlertPosition.bottomLeft,
      [css.topSide]:
        position === EAlertPosition.topLeft ||
        position === EAlertPosition.topRight,
      [css.bottomSide]:
        position === EAlertPosition.bottomLeft ||
        position === EAlertPosition.bottomRight,
      [css.centerSide]: position === EAlertPosition.bottom,
      [css.warning]: type === EAlertType.warning,
      [css.success]: type === EAlertType.success,
    },
    openClassName ? { [openClassName]: isOpen } : {},
    className,
  );

  const messageClasses = classNames(css.message, messageClassName);
  const containerClasses = classNames(css.container, containerClassName);

  useEffect(() => {
    if (isOpen && autoClose) {
      setTimeout(() => {
        onClose();
      }, timeToClose);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <div className={rootClasses}>
      <div className={containerClasses}>
        <RenderWhen condition={type === EAlertType.warning}>
          {customIcon || <IconWarningWithTriangle />}
        </RenderWhen>
        <RenderWhen condition={type === EAlertType.success}>
          {customIcon || <IconTickWithBackground className={css.icon} />}
        </RenderWhen>
        <div className={messageClasses}>{message}</div>
      </div>
      <RenderWhen condition={hasCloseButton}>
        <div className={css.closeContainer}>
          <IconClose className={css.closeIcon} onClick={onClose} />
        </div>
      </RenderWhen>
    </div>
  );
};

export default Alert;
