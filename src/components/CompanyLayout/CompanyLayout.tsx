import CompanySidebar from '@components/CompanySidebar/CompanySidebar';
import GeneralHeader from '@components/GeneralHeader/GeneralHeader';
import GeneralLayoutContent from '@components/GeneralLayoutContent/GeneralLayoutContent';
import GeneralMainContent from '@components/GeneralMainContent/GeneralMainContent';
import type { ReactNode } from 'react';

type TCompanyLayout = {
  children: ReactNode;
};

const CompanyLayout = (props: TCompanyLayout) => {
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
