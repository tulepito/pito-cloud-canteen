import { useEffect } from 'react';
import { useRouter } from 'next/router';

import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { currentUserSelector } from '@redux/slices/user.slice';
import { partnerPaths } from '@src/paths';

import { PartnerSettingsThunks } from '../../PartnerSettings.slice';
import AccountSettingsModal from '../components/AccountSettingsModal';

type TPartnerAccountSettingsMobilePageProps = {};

const PartnerAccountSettingsMobilePage: React.FC<
  TPartnerAccountSettingsMobilePageProps
> = () => {
  const router = useRouter();
  const currentUser = useAppSelector(currentUserSelector);
  const dispatch = useAppDispatch();

  const handleClose = () => {
    router.push(partnerPaths.AccountSettings);
  };

  useEffect(() => {
    if (currentUser === null) return;

    dispatch(PartnerSettingsThunks.loadData());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(currentUser)]);

  return (
    <div>
      <AccountSettingsModal isOpen onClose={handleClose} />
    </div>
  );
};

export default PartnerAccountSettingsMobilePage;
