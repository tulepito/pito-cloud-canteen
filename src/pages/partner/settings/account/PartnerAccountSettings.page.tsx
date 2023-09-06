/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo, useState } from 'react';
import isEqual from 'lodash/isEqual';
import { useRouter } from 'next/router';

import Button from '@components/Button/Button';
import IconEdit from '@components/Icons/IconEdit/IconEdit';
import Modal from '@components/Modal/Modal';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { useViewport } from '@hooks/useViewport';
import { currentUserSelector } from '@redux/slices/user.slice';
import { partnerPaths } from '@src/paths';
import {
  CurrentUser,
  getLocationInitialValues,
  OwnListing,
} from '@src/utils/data';

import MediaForm from '../components/MediaForm';
import { PartnerSettingsThunks } from '../PartnerSettings.slice';

import AccountSettingsForm from './components/AccountSettingsForm';
import BankInfoForm from './components/BankInfoForm';
import MenuInfo from './components/MenuInfo';
import type { TMenuSettingsFormValues } from './components/MenuSettingsForm';
import MenuSettingsForm from './components/MenuSettingsForm';
import NavigationModal from './components/NavigationModal';

import css from './PartnerAccountSettingsPage.module.scss';

type TPartnerAccountSettingsPageProps = {};

const PartnerAccountSettingsPage: React.FC<
  TPartnerAccountSettingsPageProps
> = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isMobileLayout } = useViewport();
  const menuViewModeController = useBoolean(true);
  const updateRestaurantInprogress = useAppSelector(
    (state) => state.PartnerSettingsPage.updateRestaurantInprogress,
  );
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

  const [pageFormValues, setPageFormValues] = useState<any>({
    ...accountFormInitialValues,
  });
  const isAccountFormChanged = !isEqual(
    pageFormValues,
    accountFormInitialValues,
  );

  const handleChangeMenuViewMode = () => {
    menuViewModeController.toggle();
  };
  const handleCloseNavigationModal = () => {
    router.push(partnerPaths.Settings);
  };

  const handleSubmitMenuSettingsForm = async (
    values: TMenuSettingsFormValues,
  ) => {
    await dispatch(
      PartnerSettingsThunks.updatePartnerRestaurantListing(values),
    );

    menuViewModeController.setTrue();
  };

  const handleSubmitPageForm = () => {
    return dispatch(
      PartnerSettingsThunks.updatePartnerRestaurantListing(pageFormValues),
    );
  };

  return (
    <div className={css.root}>
      <RenderWhen condition={isMobileLayout}>
        <NavigationModal isOpen onClose={handleCloseNavigationModal} />

        <RenderWhen.False>
          <div className={css.pageTitle}>Cài đặt</div>

          <div className={css.accountSettingsContainer}>
            <div className={css.menuSettingsTitle}>Thông tin tài khoản</div>
            <MediaForm />

            <AccountSettingsForm
              initialValues={accountFormInitialValues}
              onSubmit={() => {}}
              onFormChange={setPageFormValues}
            />
          </div>

          <div className={css.menuSettingsContainer}>
            <div className={css.menuSettingsTitle}>
              <div>Thực đơn</div>
              <div
                className={css.editIconContainer}
                onClick={handleChangeMenuViewMode}>
                <IconEdit />
              </div>
            </div>

            <MenuInfo meals={meals} categories={categories} />
            <Modal
              title="Chỉnh Sửa thực đơn"
              isOpen={!isInMenuViewMode}
              handleClose={menuViewModeController.setTrue}>
              <MenuSettingsForm
                initialValues={menuEditFormInitialValues}
                onSubmit={handleSubmitMenuSettingsForm}
              />
            </Modal>
          </div>
          <BankInfoForm
            initialValues={bankInfoInitialValues}
            onSubmit={() => {}}
          />

          <div className={css.divider} />
          <Button
            type="button"
            className={css.submitBtn}
            disabled={!isAccountFormChanged}
            inProgress={updateRestaurantInprogress}
            onClick={handleSubmitPageForm}>
            Lưu thay đổi
          </Button>
        </RenderWhen.False>
      </RenderWhen>
    </div>
  );
};

export default PartnerAccountSettingsPage;
