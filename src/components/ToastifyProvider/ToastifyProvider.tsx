import type { PropsWithChildren } from 'react';
import { ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
import css from './ToastifyProvider.module.scss';

type ToastifyProviderProps = {} & PropsWithChildren<{}>;
const ToastifyProvider: React.FC<ToastifyProviderProps> = ({ children }) => {
  return (
    <>
      {children}
      <ToastContainer className={css.container} />
    </>
  );
};

export default ToastifyProvider;
