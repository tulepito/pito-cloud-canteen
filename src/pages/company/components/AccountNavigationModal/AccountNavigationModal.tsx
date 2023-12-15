import { useIntl } from 'react-intl';
import { useRouter } from 'next/router';

import FeatureIcons from '@components/FeatureIcons/FeatureIcons';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import IconFood from '@components/Icons/IconFood/IconFood';
import IconLock from '@components/Icons/IconLock/IconLock';
import IconLogout from '@components/Icons/IconLogout/IconLogout';
import IconSwap from '@components/Icons/IconSwap/IconSwap';
import IconUser from '@components/Icons/IconUser/IconUser';
import { useLogout } from '@hooks/useLogout';
import { useRoleSelectModalController } from '@hooks/useRoleSelectModalController';
import { personalPaths } from '@src/paths';

import css from './AccountNavigationModal.module.scss';

type TAccountNavigationModalProps = {};

const AccountNavigationModal: React.FC<TAccountNavigationModalProps> = () => {
  const router = useRouter();
  const intl = useIntl();

  const { onOpenRoleSelectModal } = useRoleSelectModalController();

  const handleNavigatePage = (url: string) => {
    router.push(url);
  };

  const handleLogOut = useLogout();

  return (
    <div className={css.root}>
      <div className={css.heading}>
        <span>{intl.formatMessage({ id: 'CompanySidebar.account' })}</span>
      </div>

      <div>
        <div
          className={css.itemRow}
          onClick={() => handleNavigatePage(personalPaths.Info)}>
          <div className={css.headerTitle}>
            <FeatureIcons.User />
            <span>
              {intl.formatMessage({ id: 'CompanySidebar.accountSetting' })}
            </span>
          </div>
          <IconArrow direction="right" />
        </div>
        <div
          className={css.itemRow}
          onClick={() => handleNavigatePage(personalPaths.Nutrition)}>
          <div className={css.headerTitle}>
            <IconFood />
            <span>
              {intl.formatMessage({ id: 'CompanySidebar.nutrition' })}
            </span>
          </div>
          <IconArrow direction="right" />
        </div>
        <div
          className={css.itemRow}
          onClick={() => handleNavigatePage(personalPaths.Members)}>
          <div className={css.headerTitle}>
            <IconUser variant="multiUserNoBackground" />
            <span>{intl.formatMessage({ id: 'CompanySidebar.members' })}</span>
          </div>
          <IconArrow direction="right" />
        </div>
        <div
          className={css.itemRow}
          onClick={() => handleNavigatePage(personalPaths.ChangePassword)}>
          <div className={css.headerTitle}>
            <IconLock />
            <span>
              {intl.formatMessage({ id: 'CompanySidebar.passwordSetting' })}
            </span>
          </div>
          <IconArrow direction="right" />
        </div>
        <div className={css.itemRow} onClick={onOpenRoleSelectModal}>
          <div className={css.headerTitle}>
            <IconSwap className={css.iconSwap} />
            <span>
              {intl.formatMessage({ id: 'CompanyHeaderMobile.changeRole' })}
            </span>
          </div>
          <IconArrow direction="right" />
        </div>
        <div className={css.itemRow} onClick={handleLogOut}>
          <div className={css.headerTitle}>
            <IconLogout />
            <span>
              {intl.formatMessage({ id: 'CompanyHeaderMobile.logout' })}
            </span>
          </div>
          <IconArrow direction="right" />
        </div>
      </div>
    </div>
  );
};

export default AccountNavigationModal;
