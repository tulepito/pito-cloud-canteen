import type { ToastOptions } from 'react-toastify';

import IconClose from '@components/Icons/IconClose/IconClose';
import IconCloseSquare from '@components/Icons/IconCloseSquare/IconCloseSquare';
import IconTickSquare from '@components/Icons/IconTickSquare/IconTickSquare';

import css from './toastify.module.scss';

export const bottomRightToastOptions: ToastOptions = {
  position: 'bottom-right',
  autoClose: 3000,
  hideProgressBar: true,
};

const defaultOptions: ToastOptions = {
  type: 'default',
  hideProgressBar: true,
  autoClose: 3000,
  bodyClassName: css.body,
  closeButton: <IconClose className={css.icon} />,
};

export const successToastOptions: ToastOptions = {
  ...defaultOptions,
  className: css.successContainer,
  icon: <IconTickSquare className={css.icon} />,
};

export const errorToastOptions: ToastOptions = {
  ...defaultOptions,
  className: css.errorContainer,
  bodyClassName: css.errorBody,
  icon: <IconCloseSquare className={css.errorIcon} />,
};
