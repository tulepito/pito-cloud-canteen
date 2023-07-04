import MetaWrapper from '@components/MetaWrapper/MetaWrapper';

import AdminAccountInformationSettingPage from './info/AdminAccountInformationSetting.page';

export default function AdminAccountSettingPageRoute() {
  return (
    <MetaWrapper routeName="AdminAccountSettingPageRoute">
      <AdminAccountInformationSettingPage />
    </MetaWrapper>
  );
}
