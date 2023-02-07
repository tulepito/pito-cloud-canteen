import Button from '@components/Button/Button';
import ConfirmationModal from '@components/ConfirmationModal/ConfirmationModal';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import useFetchCompanyInfo from '@hooks/useFetchCompanyInfo';
import { BookerManageCompany } from '@redux/slices/company.slice';
import { resetImage } from '@redux/slices/uploadImage.slice';
import { USER } from '@utils/data';
import type { TCurrentUser, TUser } from '@utils/types';
import take from 'lodash/take';
import takeRight from 'lodash/takeRight';
import { useEffect, useMemo, useRef } from 'react';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';

import type { TContactPointProfileFormValues } from './components/ContactPointProfileForm/ContactPointProfileForm';
import ContactPointProfileForm from './components/ContactPointProfileForm/ContactPointProfileForm';
import css from './ContactPoint.module.scss';

const ContactPointPage = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const formSubmitInputRef = useRef<any>();
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

  const { companyName = '', location = {} } = USER(
    company as TUser,
  ).getPublicData();
  const { email = '' } = USER(company as TUser).getAttributes();
  const { address = '' } = location;

  const { email: bookerEmail = '' } = USER(currentUser!).getAttributes();
  const { displayName: bookerDisplayName = '' } = USER(
    currentUser!,
  ).getProfile();
  const { phoneNumber: bookerPhoneNumber = '' } = USER(
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
    const wordList = displayName.split(' ');
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
        {intl.formatMessage({ id: 'ContactPointPage.account' })}
      </div>
      <div className={css.contactPointSection}>
        <div className={css.sectionTitle}>
          {intl.formatMessage({ id: 'ContactPointPage.contactPoint' })}
        </div>
        <div className={css.formWrapper}>
          <ContactPointProfileForm
            bookerAccount={currentUser as TCurrentUser}
            onSubmit={onSubmit}
            submitInputRef={formSubmitInputRef}
            initialValues={initialFormValues}
          />
        </div>
      </div>
      <div className={css.companyInfoSection}>
        <div className={css.sectionTitle}>
          {intl.formatMessage({ id: 'ContactPointPage.companyInfo' })}
        </div>
        <div className={css.row}>
          <div className={css.info}>
            <div className={css.title}>
              {intl.formatMessage({ id: 'ContactPointPage.companyName' })}
            </div>
            <div className={css.content}>{companyName}</div>
          </div>
          <div className={css.info}>
            <div className={css.title}>
              {intl.formatMessage({ id: 'ContactPointPage.address' })}
            </div>
            <div className={css.content}>{address}</div>
          </div>
        </div>
        <div className={css.row}>
          <div className={css.info}>
            <div className={css.title}>
              {intl.formatMessage({ id: 'ContactPointPage.taxCode' })}
            </div>
            <div className={css.content}></div>
          </div>
          <div className={css.info}>
            <div className={css.title}>
              {intl.formatMessage({ id: 'ContactPointPage.email' })}
            </div>
            <div className={css.content}>{email}</div>
          </div>
        </div>
      </div>
      <div className={css.submitBtn}>
        <Button
          className={css.btn}
          onClick={onSubmitButtonClick}
          inProgress={updateBookerInProgress}>
          {intl.formatMessage({ id: 'ContactPointPage.submitBtn' })}
        </Button>
      </div>
      <ConfirmationModal
        id="UpdateBookerConfirmationModal"
        isOpen={isConfirmationModalOpen}
        onClose={closeConfirmationModal}
        title={intl.formatMessage({
          id: 'ContactPointPage.confirmationModal.title',
        })}
        description={
          updateBookerError
            ? intl.formatMessage({
                id: 'ContactPointPage.confirmationModal.error',
              })
            : intl.formatMessage({
                id: 'ContactPointPage.confirmationModal.success',
              })
        }
      />
    </div>
  );
};

export default ContactPointPage;
