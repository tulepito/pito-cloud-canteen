import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

import HighlightBox from '@components/HighlightBox/HighlightBox';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import Modal from '@components/Modal/Modal';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { currentUserSelector } from '@redux/slices/user.slice';
import {
  CurrentUser,
  getLocationInitialValues,
  OwnListing,
} from '@src/utils/data';

import { PartnerSettingsThunks } from '../../PartnerSettings.slice';
import { IS_PARTNER_PROFILE_EDITABLE } from '../helpers/constants';

import type { TAccountSettingsFormValues } from './AccountSettingsForm';
import AccountSettingsForm from './AccountSettingsForm';

import css from './AccountSettingsModal.module.scss';

type TNavigationModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const AccountSettingsModal: React.FC<TNavigationModalProps> = (props) => {
  const { isOpen, onClose } = props;
  const submittedControl = useBoolean();
  const dispatch = useAppDispatch();
  const restaurantListing = useAppSelector(
    (state) => state.PartnerSettingsPage.restaurantListing,
  );
  const currentUser = useAppSelector(currentUserSelector);

  const restaurantGetter = OwnListing(restaurantListing);
  const { email } = CurrentUser(currentUser).getAttributes();
  const { title } = restaurantGetter.getAttributes();
  const { companyName, contactorName, website, facebookLink, phoneNumber } =
    restaurantGetter.getPublicData();

  const initialValues = useMemo(
    () => ({
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
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(restaurantListing)],
  );

  const handleSubmitAccountSettingForm = async (
    values: TAccountSettingsFormValues,
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const { website = '', facebookLink = '', ...restValues } = values;

    const response = await dispatch(
      PartnerSettingsThunks.updatePartnerRestaurantListing({
        website,
        facebookLink,
        ...restValues,
      }),
    );

    if (response.meta.requestStatus !== 'rejected') {
      submittedControl.setTrue();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      className={css.root}
      handleClose={() => {}}
      containerClassName={css.modalContainer}
      headerClassName={css.modalHeader}
      shouldHideIconClose>
      <div>
        <div className={css.heading} onClick={onClose}>
          <IconArrow direction="left" />
          <div>Thông tin tài khoản</div>
        </div>

        {!IS_PARTNER_PROFILE_EDITABLE && (
          <HighlightBox className={css.announcement}>
            <FormattedMessage id="AccountSettingsModal.announcement" />
          </HighlightBox>
        )}

        <AccountSettingsForm
          initialValues={initialValues}
          onSubmit={handleSubmitAccountSettingForm}
          isSubmitted={submittedControl.value}
          setSubmitted={submittedControl.setValue}
          disabled={!IS_PARTNER_PROFILE_EDITABLE}
        />
      </div>
    </Modal>
  );
};

export default AccountSettingsModal;
