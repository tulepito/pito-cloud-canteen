import { useEffect } from 'react';
import classNames from 'classnames';

import IconClose from '@components/Icons/IconClose/IconClose';
import IconWarningWithTriangle from '@components/Icons/IconWarningWithTriangle/IconWarningWithTriangle';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import type { TDefaultProps } from '@src/utils/types';

import css from './Alert.module.scss';

const DEFAULT_CLOSE_TIME = 2000;

export enum EAlertPosition {
  topRight = 'topRight',
  topLeft = 'topLeft',
  bottomRight = 'bottomRight',
  bottomLeft = 'bottomLeft',
}

export enum EAlertType {
  warning = 'warning',
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
};

const Alert: React.FC<TAlertProps> = (props) => {
  const {
    isOpen = true,
    openClassName,
    message,
    messageClassName,
    className,
    position = EAlertPosition.topRight,
    type = EAlertType.warning,
    hasCloseButton = true,
    onClose,
    autoClose = true,
    timeToClose = DEFAULT_CLOSE_TIME,
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
      [css.warning]: type === EAlertType.warning,
    },
    openClassName ? { [openClassName]: isOpen } : {},
    className,
  );

  const messageClasses = classNames(css.message, messageClassName);

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
      <div className={css.container}>
        <RenderWhen condition={type === EAlertType.warning}>
          <IconWarningWithTriangle />
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
