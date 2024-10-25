import type { PropsWithChildren } from 'react';

import { NotificationContainer } from '@components/NotificationContainer/NotificationContainer';
import useLockBodyScroll from '@hooks/useDisableBodyScroll';

import GleapCSSInjector from './GleapCSSInjector';
import ThirdPartiesCaller from './ThirdPartiesCaller';

type TUIProviderProps = PropsWithChildren<{}>;
const UIProvider: React.FC<TUIProviderProps> = ({ children }) => {
  useLockBodyScroll();

  return (
    <>
      <NotificationContainer />
      <ThirdPartiesCaller />
      <GleapCSSInjector />
      {children}
    </>
  );
};

export default UIProvider;
