import { useRouter } from 'next/router';

import { partnerPaths } from '@src/paths';

import NavigationModal from './components/NavigationModal';

import css from './PartnerAccountSettingsPage.module.scss';

type TPartnerAccountSettingsPageProps = {};

const PartnerAccountSettingsPage: React.FC<
  TPartnerAccountSettingsPageProps
> = () => {
  const router = useRouter();

  const handleClose = () => {
    router.push(partnerPaths.Settings);
  };

  return (
    <div className={css.root}>
      <NavigationModal isOpen onClose={handleClose} />
    </div>
  );
};

export default PartnerAccountSettingsPage;
