import { useAppDispatch } from '@hooks/reduxHooks';
import useFetchCompanyInfo from '@hooks/useFetchCompanyInfo';
import { BookerManageCompany } from '@redux/slices/company.slice';
import { useIntl } from 'react-intl';

import UploadImageForm from './components/UploadImageForm/UploadImageForm';
import css from './LogoSetting.module.scss';

const LogoSettingPage = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  useFetchCompanyInfo();
  const onSubmit = () => {
    dispatch(BookerManageCompany.updateCompanyAccount());
  };
  return (
    <div className={css.container}>
      <div className={css.header}>
        {intl.formatMessage({ id: 'LogoSettingPage.logo' })}
      </div>
      <div className={css.uploadImageFormWrapper}>
        <UploadImageForm onSubmit={onSubmit} />
      </div>
    </div>
  );
};

export default LogoSettingPage;
