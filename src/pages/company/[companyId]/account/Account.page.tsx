import { useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';
import take from 'lodash/take';
import takeRight from 'lodash/takeRight';

import Button from '@components/Button/Button';
import ConfirmationModal from '@components/ConfirmationModal/ConfirmationModal';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import useFetchCompanyInfo from '@hooks/useFetchCompanyInfo';
import { BookerManageCompany } from '@redux/slices/company.slice';
import { resetImage } from '@redux/slices/uploadImage.slice';
import { User } from '@utils/data';
import type { TCurrentUser, TUser } from '@utils/types';

import type { TContactPointProfileFormValues } from './components/ContactPointProfileForm/ContactPointProfileForm';
import ContactPointProfileForm from './components/ContactPointProfileForm/ContactPointProfileForm';

import css from './Account.module.scss';

const AccountPage = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

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

  const { companyName = '', location = {} } = User(
    company as TUser,
  ).getPublicData();
  const { email = '' } = User(company as TUser).getAttributes();
  const { address = '' } = location;

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
  useFetchCompanyInfo();

  const onSubmit = async (values: TContactPointProfileFormValues) => {
    const { displayName, phoneNumber } = values;
    const wordList = displayName.trim().split(' ');
    const firstName = take(wordList, wordList.length - 1);
    const lastName = takeRight(wordList).join();
    const profile = {
      firstName: firstName.join(),
      lastName,
      displayName,
      protectedData: {
        phoneNumber,
      },
    };
    const updatedValues =
      image && image.imageId && image.file
        ? { ...profile, profileImageId: image.imageId }
        : profile;
    await dispatch(BookerManageCompany.updateBookerAccount(updatedValues));
    dispatch(resetImage());
    openConfirmationModal();
  };

  const onSubmitButtonClick = (e: any) => {
    if (typeof formSubmitInputRef?.current === 'function')
      formSubmitInputRef.current(e);
  };
  return (
    <div className={css.container}>
      <div className={css.header}>
        {intl.formatMessage({ id: 'AccountPage.account' })}
      </div>
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
            <div className={css.content}></div>
          </div>
          <div className={css.info}>
            <div className={css.title}>
              {intl.formatMessage({ id: 'AccountPage.email' })}
            </div>
            <div className={css.content}>{email}</div>
          </div>
        </div>
      </div>
      <div className={css.submitBtn}>
        <Button
          className={css.btn}
          onClick={onSubmitButtonClick}
          disabled={formDisabled}
          inProgress={updateBookerInProgress}>
          {intl.formatMessage({ id: 'AccountPage.submitBtn' })}
        </Button>
      </div>
      <ConfirmationModal
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
