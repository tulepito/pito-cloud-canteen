import { useRouter } from 'next/router';

import { partnerPaths } from '@src/paths';

import AccountSettingsModal from '../components/AccountSettingsModal';

type TPartnerAccountSettingsMobilePageProps = {};

const PartnerAccountSettingsMobilePage: React.FC<
  TPartnerAccountSettingsMobilePageProps
> = () => {
  const router = useRouter();

  const handleClose = () => {
    router.push(partnerPaths.AccountSettings);
  };

  return (
    <div>
      <AccountSettingsModal isOpen onClose={handleClose} />
    </div>
  );
};

export default PartnerAccountSettingsMobilePage;
