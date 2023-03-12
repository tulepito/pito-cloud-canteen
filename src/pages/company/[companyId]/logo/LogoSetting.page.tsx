import { useEffect } from 'react';
import { useIntl } from 'react-intl';

import { useAppDispatch } from '@hooks/reduxHooks';
import useFetchCompanyInfo from '@hooks/useFetchCompanyInfo';
import { BookerManageCompany } from '@redux/slices/company.slice';
import { resetImage } from '@redux/slices/uploadImage.slice';

import UploadImageForm from './components/UploadImageForm/UploadImageForm';

import css from './LogoSetting.module.scss';

const LogoSettingPage = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  useFetchCompanyInfo();
  useEffect(() => {
    dispatch(resetImage());
  }, [dispatch]);
  const onSubmit = async () => {
    await dispatch(BookerManageCompany.updateCompanyAccount({}));
    dispatch(resetImage());
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
