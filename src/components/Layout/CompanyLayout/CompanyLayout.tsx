import type { PropsWithChildren } from 'react';

import CompanySidebar from './CompanySidebar/CompanySidebar';
import GeneralHeader from './GeneralHeader/GeneralHeader';
import GeneralLayoutContent from './GeneralLayoutContent/GeneralLayoutContent';
import GeneralMainContent from './GeneralMainContent/GeneralMainContent';

const CompanyLayout: React.FC<PropsWithChildren> = (props) => {
  const { children } = props;
  return (
    <>
      <GeneralHeader />
      <GeneralLayoutContent>
        <CompanySidebar />
        <GeneralMainContent>{children}</GeneralMainContent>
      </GeneralLayoutContent>
    </>
  );
};

export default CompanyLayout;
