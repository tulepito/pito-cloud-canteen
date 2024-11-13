import type { PropsWithChildren } from 'react';
import { toast, ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
import css from './ToastifyProvider.module.scss';

export const BOTTOM_CENTER_TOAST_ID = css.bottomCenterToast;

type ToastifyProviderProps = {} & PropsWithChildren<{}>;

const ToastifyProvider: React.FC<ToastifyProviderProps> = ({ children }) => {
  return (
    <>
      {children}

      <ToastContainer
        enableMultiContainer
        className={css.defaultToastContainer}
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        position={toast.POSITION.BOTTOM_CENTER}
      />

      <ToastContainer
        enableMultiContainer
        className={css.bottomCenterContainer}
        containerId={css.bottomCenterToast}
        position={toast.POSITION.BOTTOM_CENTER}
      />
    </>
  );
};

export default ToastifyProvider;
