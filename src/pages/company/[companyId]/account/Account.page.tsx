import { useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';
import take from 'lodash/take';
import takeRight from 'lodash/takeRight';
import { useRouter } from 'next/router';

import Button from '@components/Button/Button';
import ConfirmationModal from '@components/ConfirmationModal/ConfirmationModal';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import useFetchCompanyInfo from '@hooks/useFetchCompanyInfo';
import useFetchCompanyInfoCurrentUser from '@hooks/useFetchCompanyInfoCurrentUser';
import { useViewport } from '@hooks/useViewport';
import { companyThunks } from '@redux/slices/company.slice';
import { resetImage } from '@redux/slices/uploadImage.slice';
import { personalPaths } from '@src/paths';
import { User } from '@utils/data';
import type { TCurrentUser, TUser } from '@utils/types';

import type { TContactPointProfileFormValues } from './components/ContactPointProfileForm/ContactPointProfileForm';
import ContactPointProfileForm from './components/ContactPointProfileForm/ContactPointProfileForm';

import css from './Account.module.scss';

const AccountPage = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const router = useRouter();
  const { query } = router;
  const { companyId } = query;

  const { isMobileLayout, isTabletLayout } = useViewport();

  const formSubmitInputRef = useRef<any>();
  const [formDisabled, setFormDisabled] = useState<boolean>(true);
  const {
    value: isConfirmationModalOpen,
    setTrue: openConfirmationModal,
    setFalse: closeConfirmationModal,
  } = useBoolean();

  const currentUser = useAppSelector(
    (state) => state.user.currentUser,
    shallowEqual,
  );

  const company = useAppSelector(
    (state) => state.company.company,
    shallowEqual,
  );

  const image = useAppSelector(
    (state) => state.uploadImage.image,
    shallowEqual,
  );
  const updateBookerInProgress = useAppSelector(
    (state) => state.company.updateBookerAccountInProgress,
  );
  const updateBookerError = useAppSelector(
    (state) => state.company.updateBookerAccountError,
  );
  const fetchCompanyInfoInProgress = useAppSelector(
    (state) => state.company.fetchCompanyInfoInProgress,
  );
  const companyUser = User(company as TUser);
  const { companyName = '', companyLocation = {} } =
    companyUser.getPublicData();
  const { email = '' } = companyUser.getAttributes();
  const { address = '' } = companyLocation;
  const { tax } = companyUser.getPrivateData();

  const { email: bookerEmail = '' } = User(currentUser!).getAttributes();
  const { displayName: bookerDisplayName = '' } = User(
    currentUser!,
  ).getProfile();
  const { phoneNumber: bookerPhoneNumber = '' } = User(
    currentUser!,
  ).getProtectedData();
  const initialFormValues = useMemo<TContactPointProfileFormValues>(
    () => ({
      displayName: bookerDisplayName,
      email: bookerEmail,
      phoneNumber: bookerPhoneNumber,
    }),
    [bookerDisplayName, bookerEmail, bookerPhoneNumber],
  );

  useEffect(() => {
    dispatch(resetImage());
  }, [dispatch]);

  if (companyId === 'personal') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useFetchCompanyInfoCurrentUser();
  } else {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useFetchCompanyInfo();
  }

  const onSubmit = async (values: TContactPointProfileFormValues) => {
    const { displayName, phoneNumber } = values;
    const wordList = displayName.trim().split(' ');
    const lastName = take(wordList, wordList.length - 1);
    const firstName = takeRight(wordList).join();
    const profile = {
      firstName,
      lastName: lastName.join(' '),
      displayName,
      protectedData: {
        phoneNumber,
      },
    };
    const updatedValues =
      image && image.imageId && image.file
        ? { ...profile, profileImageId: image.imageId }
        : profile;
    await dispatch(companyThunks.updateBookerAccount(updatedValues));
    dispatch(resetImage());
    openConfirmationModal();
  };

  const onSubmitButtonClick = (e: any) => {
    if (typeof formSubmitInputRef?.current === 'function')
      formSubmitInputRef.current(e);
  };

  const navigateAccountPersonalPage = () => {
    router.push({
      pathname: personalPaths.Account,
      query: { companyId: 'personal' },
    });
  };

  return (
    <div className={css.container}>
      {isMobileLayout || isTabletLayout ? (
        <div className={css.header}>
          <IconArrow direction="left" onClick={navigateAccountPersonalPage} />
          <span>
            {intl.formatMessage({ id: 'AdminSidebar.accountSettingLabel' })}
          </span>
        </div>
      ) : (
        <div className={css.header}>
          <span>{intl.formatMessage({ id: 'AccountPage.account' })}</span>
        </div>
      )}

      <div className={css.contactPointSection}>
        <div className={css.sectionTitle}>
          {intl.formatMessage({ id: 'AccountPage.contactPoint' })}
        </div>
        <div className={css.formWrapper}>
          <ContactPointProfileForm
            bookerAccount={currentUser as TCurrentUser}
            onSubmit={onSubmit}
            formRef={formSubmitInputRef}
            initialValues={initialFormValues}
            setFormDisabled={setFormDisabled}
          />
        </div>
      </div>
      <div className={css.companyInfoSection}>
        <div className={css.sectionTitle}>
          {intl.formatMessage({ id: 'AccountPage.companyInfo' })}
        </div>
        {fetchCompanyInfoInProgress ? (
          <div className={css.loading}>
            {intl.formatMessage({ id: 'AccountPage.loading' })}
          </div>
        ) : (
          <>
            <div className={css.row}>
              <div className={css.info}>
                <div className={css.title}>
                  {intl.formatMessage({ id: 'AccountPage.companyName' })}
                </div>
                <div className={css.content}>{companyName}</div>
              </div>
              <div className={css.info}>
                <div className={css.title}>
                  {intl.formatMessage({ id: 'AccountPage.address' })}
                </div>
                <div className={css.content}>{address}</div>
              </div>
            </div>
            <div className={css.row}>
              <div className={css.info}>
                <div className={css.title}>
                  {intl.formatMessage({ id: 'AccountPage.taxCode' })}
                </div>
                <div className={css.content}>{tax}</div>
              </div>
              <div className={css.info}>
                <div className={css.title}>
                  {intl.formatMessage({ id: 'AccountPage.email' })}
                </div>
                <div className={css.content}>{email}</div>
              </div>
            </div>
          </>
        )}
      </div>
      <div className={css.submitBtn}>
        <div>
          <Button
            className={css.btn}
            onClick={onSubmitButtonClick}
            disabled={formDisabled}
            inProgress={updateBookerInProgress}>
            {intl.formatMessage({ id: 'AccountPage.submitBtn' })}
          </Button>
        </div>
      </div>
      <ConfirmationModal
        isPopup={isMobileLayout}
        id="UpdateBookerConfirmationModal"
        isOpen={isConfirmationModalOpen}
        onClose={closeConfirmationModal}
        title={intl.formatMessage({
          id: 'AccountPage.confirmationModal.title',
        })}
        description={
          updateBookerError
            ? intl.formatMessage({
                id: 'AccountPage.confirmationModal.error',
              })
            : intl.formatMessage({
                id: 'AccountPage.confirmationModal.success',
              })
        }
      />
    </div>
  );
};

export default AccountPage;
