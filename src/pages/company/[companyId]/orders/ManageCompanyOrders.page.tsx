/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useRouter } from 'next/router';

import { getCompanyIdFromBookerUser } from '@helpers/company';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { resetCompanyOrdersStates } from '@redux/slices/Order.slice';
import { currentUserSelector } from '@redux/slices/user.slice';
import { companyPaths } from '@src/paths';

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

  const sectionTitle = intl.formatMessage({
    id: 'ManageCompanyOrdersPage.titleSection.title',
  });
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
      (!companyIdFormQuery || companyIdFormQuery === '[companyId]')
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
    <div className={css.root}>
      <section className={css.titleSection}>
        <div className={css.title}>{sectionTitle}</div>
        <div className={css.subtitle}>{sectionTitleSubtitle}</div>
      </section>

      <CompanyOrdersTable />
    </div>
  );
};

export default ManageCompanyOrdersPage;
