import type { PropsWithChildren } from 'react';

import { NotificationContainer } from '@components/NotificationContainer/NotificationContainer';
import useLockBodyScroll from '@hooks/useDisableBodyScroll';

type TUIProviderProps = PropsWithChildren<{}>;
const UIProvider: React.FC<TUIProviderProps> = ({ children }) => {
  useLockBodyScroll();

  return (
    <>
      <NotificationContainer />
      {children}
    </>
  );
};

export default UIProvider;
