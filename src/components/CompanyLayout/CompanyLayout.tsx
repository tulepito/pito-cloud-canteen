import CompanySidebar from '@components/CompanySidebar/CompanySidebar';
import GeneralHeader from '@components/GeneralHeader/GeneralHeader';
import GeneralLayoutContent from '@components/GeneralLayoutContent/GeneralLayoutContent';
import GeneralMainContent from '@components/GeneralMainContent/GeneralMainContent';
import type { PropsWithChildren } from 'react';

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
