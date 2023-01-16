import { useAppDispatch } from '@hooks/reduxHooks';
import { BookerManageCompany } from '@redux/slices/company.slice';
import { useEffect } from 'react';

import css from './CompanySetting.module.scss';
import CompanySettingForm from './components/CompanySettingForm/CompanySettingForm';

const CompanySettingPage: React.FC = () => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(BookerManageCompany.companyInfo());
  }, []);
  return (
    <div className={css.container}>
      <CompanySettingForm />
    </div>
  );
};

export default CompanySettingPage;
