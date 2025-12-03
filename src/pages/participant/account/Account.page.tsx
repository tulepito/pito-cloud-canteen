/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { useIntl } from 'react-intl';
import { MessageCircleIcon } from 'lucide-react';
import { useRouter } from 'next/router';

import BottomNavigationBar from '@components/BottomNavigationBar/BottomNavigationBar';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import IconFood from '@components/Icons/IconFood/IconFood';
import IconLock from '@components/Icons/IconLock/IconLock';
import IconLogout from '@components/Icons/IconLogout/IconLogout';
import IconSwap from '@components/Icons/IconSwap/IconSwap';
import IconUser from '@components/Icons/IconUser2/IconUser2';
import { LanguageSwitchButton } from '@components/Layout/CompanyLayout/CompanyHeader/LanguageSwitchButton';
import { useAppSelector } from '@hooks/reduxHooks';
import { useLogout } from '@hooks/useLogout';
import { useRoleSelectModalController } from '@hooks/useRoleSelectModalController';
import { useViewport } from '@hooks/useViewport';
import { currentUserSelector } from '@redux/slices/user.slice';
import { participantPaths } from '@src/paths';
import Gleap from '@src/utils/gleap';

import AvatarForm from './components/AvatarForm/AvatarForm';

import css from './Account.module.scss';

const AccountPage = () => {
  const router = useRouter();
  const handleLogout = useLogout();
  const intl = useIntl();
  const { isMobileLayout } = useViewport();
  const currentUser = useAppSelector(currentUserSelector);
  const { onOpenRoleSelectModal } = useRoleSelectModalController();

  const roles = useAppSelector((state) => state.user.roles);

  const shouldShowChangeRoleOption = roles.length > 1;

  useEffect(() => {
    if (!isMobileLayout) {
      router.push(participantPaths.AccountProfile);
    }
  }, [isMobileLayout]);

  const handleOpenProfileModal = () => {
    router.push(participantPaths.AccountProfile);
  };

  const handleOpenChangePasswordModal = () => {
    router.push(participantPaths.AccountChangePassword);
  };

  const handleOpenSpecialDemandModal = () => {
    router.push(participantPaths.AccountSpecialDemand);
  };

  const handleOpenSupport = () => {
    Gleap.openChat();
  };

  return (
    <div className={css.container}>
      <div className={css.greyCircle}></div>
      <div className={css.avatarSection}>
        <AvatarForm onSubmit={() => {}} currentUser={currentUser!} />
      </div>
      <div className={css.navigationWrapper}>
        <div className={css.navigationItem} onClick={handleOpenProfileModal}>
          <div className={css.iconGroup}>
            <IconUser />
            <span>
              {intl.formatMessage({
                id: 'ParticipantAccountSettingRoute.description',
              })}
            </span>
          </div>
          <IconArrow direction="right" />
        </div>
        <div
          className={css.navigationItem}
          onClick={handleOpenChangePasswordModal}>
          <div className={css.iconGroup}>
            <IconLock />
            <span>
              {intl.formatMessage({
                id: 'ParticipantChangePasswordRoute.description',
              })}
            </span>
          </div>
          <IconArrow direction="right" />
        </div>
        <div
          className={css.navigationItem}
          onClick={handleOpenSpecialDemandModal}>
          <div className={css.iconGroup}>
            <IconFood />
            <span>
              {intl.formatMessage({
                id: 'ParticipantSpecialDemandRoute.description',
              })}
            </span>
          </div>
          <IconArrow direction="right" />
        </div>
        {shouldShowChangeRoleOption && (
          <div className={css.navigationItem} onClick={onOpenRoleSelectModal}>
            <div className={css.iconGroup}>
              <IconSwap className={css.iconSwap} />
              <span>
                {intl.formatMessage({ id: 'CompanyHeaderMobile.changeRole' })}
              </span>
            </div>
            <IconArrow direction="right" />
          </div>
        )}
        <div className={css.navigationItem}>
          <div className={css.iconGroup}>
            <IconLock />
            <span>{intl.formatMessage({ id: 'ngon-ngu' })}</span>
          </div>
          <LanguageSwitchButton />
        </div>
        <div className={css.navigationItem} onClick={handleOpenSupport}>
          <div className="flex gap-4">
            <MessageCircleIcon className="text-[#a6acb6]" />
            <span className="text-black font-semibold">
              {intl.formatMessage({ id: 'ho-tro' })}
            </span>
          </div>
        </div>
        <div className={css.navigationItem} onClick={handleLogout}>
          <div className={css.iconGroup}>
            <IconLogout />
            <span>
              {intl.formatMessage({ id: 'CompanyHeaderMobile.logout' })}
            </span>
          </div>
          <IconArrow direction="right" />
        </div>
      </div>
      <BottomNavigationBar />
    </div>
  );
};

export default AccountPage;
