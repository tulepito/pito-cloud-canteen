import { useIntl } from 'react-intl';

import CompanyOrdersTable from './components/CompanyOrdersTable';
import css from './ManageCompanyOrdersPage.module.scss';

type TManageCompanyOrdersPageProps = {};

const ManageCompanyOrdersPage: React.FC<TManageCompanyOrdersPageProps> = () => {
  const intl = useIntl();

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
