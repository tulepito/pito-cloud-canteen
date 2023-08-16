import type { PropsWithChildren } from 'react';

const PartnerMobileLayout: React.FC<PropsWithChildren> = (props) => {
  const { children } = props;

  return <div>{children}</div>;
};

export default PartnerMobileLayout;
