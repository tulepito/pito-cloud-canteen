import type { PropsWithChildren } from 'react';
import { ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

type ToastifyProviderProps = {} & PropsWithChildren<{}>;
const ToastifyProvider: React.FC<ToastifyProviderProps> = ({ children }) => {
  return (
    <>
      {children}
      <ToastContainer />
    </>
  );
};

export default ToastifyProvider;
