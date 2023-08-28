/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo } from 'react';
import { useRouter } from 'next/router';

import IconEdit from '@components/Icons/IconEdit/IconEdit';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { useViewport } from '@hooks/useViewport';
import { currentUserSelector } from '@redux/slices/user.slice';
import { partnerPaths } from '@src/paths';
import {
  CurrentUser,
  getLocationInitialValues,
  OwnListing,
} from '@src/utils/data';

import AccountSettingsForm from './components/AccountSettingsForm';
import BankInfoForm from './components/BankInfoForm';
import MenuInfo from './components/MenuInfo';
import MenuSettingsForm from './components/MenuSettingsForm';
import NavigationModal from './components/NavigationModal';

import css from './PartnerAccountSettingsPage.module.scss';

type TPartnerAccountSettingsPageProps = {};

const PartnerAccountSettingsPage: React.FC<
  TPartnerAccountSettingsPageProps
> = () => {
  const router = useRouter();
  const { isMobileLayout } = useViewport();
  const menuViewModeController = useBoolean(true);
  const restaurantListing = useAppSelector(
    (state) => state.PartnerSettingsPage.restaurantListing,
  );
  const currentUser = useAppSelector(currentUserSelector);

  const isInMenuViewMode = menuViewModeController.value;
  const restaurantGetter = OwnListing(restaurantListing);
  const { email } = CurrentUser(currentUser).getAttributes();
  const { title } = restaurantGetter.getAttributes();
  const {
    companyName,
    contactorName,
    website,
    facebookLink,
    phoneNumber,
    meals = [],
    categories = [],
  } = restaurantGetter.getPublicData();
  const { bankAccounts = [] } = restaurantGetter.getPrivateData();
  const { bankId, bankAgency, bankAccountNumber, bankOwnerName } =
    bankAccounts[0] || {
      bankId: '',
      bankAgency: '',
      bankAccountNumber: '',
      bankOwnerName: '',
    };

  const {
    accountFormInitialValues,
    menuEditFormInitialValues,
    bankInfoInitialValues,
  } = useMemo(
    () => ({
      accountFormInitialValues: {
        title,
        email,
        companyName,
        location: restaurantListing
          ? getLocationInitialValues(restaurantListing)
          : {},
        contactorName,
        phoneNumber,
        website,
        facebookLink,
      },
      menuEditFormInitialValues: {
        meals,
        categories,
      },
      bankInfoInitialValues: {
        bankId,
        bankAgency,
        bankAccountNumber,
        bankOwnerName,
      },
    }),
    [JSON.stringify(restaurantListing)],
  );

  const handleChangeMenuViewMode = () => {
    menuViewModeController.toggle();
  };
  const handleCloseNavigationModal = () => {
    router.push(partnerPaths.Settings);
  };

  return (
    <div className={css.root}>
      <RenderWhen condition={isMobileLayout}>
        <NavigationModal isOpen onClose={handleCloseNavigationModal} />

        <RenderWhen.False>
          <AccountSettingsForm
            initialValues={accountFormInitialValues}
            onSubmit={() => {}}
          />

          <div>
            <div>Thực đơn</div>
            <div
              className={css.editIconContainer}
              onClick={handleChangeMenuViewMode}>
              <IconEdit />
            </div>
            <RenderWhen condition={isInMenuViewMode}>
              <MenuInfo meals={meals} categories={categories} />

              <RenderWhen.False>
                <MenuSettingsForm
                  initialValues={menuEditFormInitialValues}
                  onSubmit={() => {}}
                />
              </RenderWhen.False>
            </RenderWhen>
          </div>
          <BankInfoForm
            initialValues={bankInfoInitialValues}
            onSubmit={() => {}}
          />
        </RenderWhen.False>
      </RenderWhen>
    </div>
  );
};

export default PartnerAccountSettingsPage;
