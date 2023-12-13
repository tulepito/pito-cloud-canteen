/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useRouter } from 'next/router';

import MobileTopContainer from '@components/MobileTopContainer/MobileTopContainer';
import { getCompanyIdFromBookerUser } from '@helpers/company';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useFetchCompanyInfo from '@hooks/useFetchCompanyInfo';
import { resetCompanyOrdersStates } from '@redux/slices/Order.slice';
import { currentUserSelector } from '@redux/slices/user.slice';
import { companyPaths } from '@src/paths';
import { upperCaseFirstLetter } from '@src/utils/validators';

import CompanyOrdersTable from './components/CompanyOrdersTable';

import css from './ManageCompanyOrdersPage.module.scss';

type TManageCompanyOrdersPageProps = {};

const ManageCompanyOrdersPage: React.FC<TManageCompanyOrdersPageProps> = () => {
  const intl = useIntl();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(currentUserSelector);

  const {
    isReady,
    replace,
    query: { companyId: companyIdFormQuery },
  } = router;
  useFetchCompanyInfo();
  const sectionTitle = upperCaseFirstLetter(
    intl
      .formatMessage({
        id: 'ManageCompanyOrdersPage.titleSection.title',
      })
      .toLowerCase(),
  );

  const sectionTitlePITOPhoneNumber = (
    <span className={css.phoneNumber}>
      {intl.formatMessage({
        id: 'ManageCompanyOrdersPage.titleSection.phoneNumber',
      })}
    </span>
  );
  const sectionTitleSubtitle = intl.formatMessage(
    {
      id: 'ManageCompanyOrdersPage.titleSection.subtitle',
    },
    { phoneNumber: sectionTitlePITOPhoneNumber },
  );

  useEffect(() => {
    if (
      isReady &&
      (!companyIdFormQuery ||
        companyIdFormQuery === '[companyId]' ||
        companyIdFormQuery === 'personal')
    ) {
      const companyId = getCompanyIdFromBookerUser(currentUser);
      replace({ pathname: companyPaths.ManageOrders, query: { companyId } });
    }
  }, [
    isReady,
    JSON.stringify(companyIdFormQuery as string),
    JSON.stringify(currentUser),
  ]);

  useEffect(() => {
    return () => {
      dispatch(resetCompanyOrdersStates());
    };
  }, []);

  return (
    <>
      <MobileTopContainer
        title={sectionTitle}
        className={css.mobileTopContainer}
      />
      <div className={css.root}>
        <section className={css.titleSection}>
          <div className={css.title}>{sectionTitle}</div>
          <div className={css.subtitle}>{sectionTitleSubtitle}</div>
        </section>

        <CompanyOrdersTable />
      </div>
    </>
  );
};

export default ManageCompanyOrdersPage;
