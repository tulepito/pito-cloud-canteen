import useLockBodyScroll from '@hooks/useDisableBodyScroll';
import type { PropsWithChildren } from 'react';

type TUIProviderProps = PropsWithChildren<{}>;
const UIProvider: React.FC<TUIProviderProps> = ({ children }) => {
  useLockBodyScroll();
  return <>{children}</>;
};

export default UIProvider;
