import FeatureIcons from '@components/FeatureIcons/FeatureIcons';
import FeaturesHeader from '@components/FeaturesHeader/FeaturesHeader';
import { useRouter } from 'next/router';
import type { PropsWithChildren } from 'react';

import { shouldShowFeatureHeader } from './companyLayout.helpers';
// import { useState } from 'react';
// import { shallowEqual } from 'react-redux';
import GeneralHeader from './GeneralHeader/GeneralHeader';

const CompanyLayout: React.FC<PropsWithChildren> = (props) => {
  const { children } = props;
  const router = useRouter();

  const showFeatureHeader = shouldShowFeatureHeader(router.pathname);

  // const currentUser = useAppSelector(currentUserSelector);
  // const companyRefs = useAppSelector(
  //   (state) => state.ManageCompaniesPage.companyRefs,
  //   shallowEqual,
  // );
  // const { companyList = [] } = CURRENT_USER(currentUser).getMetadata();
  // const assignedCompanies = filter(companyRefs, (o: any) =>
  //   companyList.includes(o.id.uuid),
  // ).reduce((result: any[], cur: TUser) => {
  //   return [
  //     ...result,
  //     {
  //       value: USER(cur).getId(),
  //       label: USER(cur).getPublicData()?.companyName,
  //     },
  //   ];
  // }, []);
  // const [selectedAccount, setSelectedAccount] = useState<{
  //   value?: string;
  //   label?: string;
  // }>({});
  // const accountOptions = [
  //   { value: '', label: 'Cá nhân' },
  //   ...assignedCompanies,
  // ];
  // useEffect(() => {
  //   if (companyId) {
  //     const currentCompany = companyRefs.find(
  //       (_company) => USER(_company).getId() === companyId,
  //     );
  //     setSelectedAccount({
  //       value: USER(currentCompany).getId(),
  //       label: USER(currentCompany).getPublicData()?.companyName,
  //     });
  //   }
  // }, [companyId]);
  const featureHeaderData = [
    {
      key: 'cart',
      icon: <FeatureIcons.Cart />,
      title: 'Đặt hàng',
      pathname: '/',
    },
    {
      key: 'order',
      icon: <FeatureIcons.Box />,
      title: 'Đơn hàng',
      pathname: '/',
    },
    {
      key: 'invoice',
      icon: <FeatureIcons.Invoice />,
      title: 'Hoá đơn',
      pathname: '/',
    },
    {
      key: 'review',
      icon: <FeatureIcons.Star />,
      title: 'Đánh giá',
      pathname: '/',
    },
    {
      key: 'introduce',
      icon: <FeatureIcons.UserCirclePlus />,
      title: 'Giới thiệu',
      pathname: '/',
    },
    // {
    //   key: 'account',
    //   icon: <FeatureIcons.User />,
    //   title: (
    //     <Dropdown
    //       options={accountOptions}
    //       selectedValue={selectedAccount}
    //       setSelectedValue={setSelectedAccount}
    //     />
    //   ),
    //   pathname: selectedAccount.value
    //     ? `/company/${selectedAccount.value}`
    //     : '/company',
    // },
  ];

  return (
    <>
      <GeneralHeader />
      {showFeatureHeader && <FeaturesHeader headerData={featureHeaderData} />}
      {/*  <GeneralLayoutContent> */}
      {/* <CompanySidebar /> */}
      {/* <GeneralMainContent>{children}</GeneralMainContent> */}
      {/* </GeneralLayoutContent> */}
      {children}
    </>
  );
};

export default CompanyLayout;
