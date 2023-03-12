import type { PropsWithChildren } from 'react';

import useLockBodyScroll from '@hooks/useDisableBodyScroll';

type TUIProviderProps = PropsWithChildren<{}>;
const UIProvider: React.FC<TUIProviderProps> = ({ children }) => {
  useLockBodyScroll();
  return <>{children}</>;
};

export default UIProvider;
