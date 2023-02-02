import Button from '@components/Button/Button';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  addWorkspaceCompanyId,
  BookerManageCompany,
} from '@redux/slices/company.slice';
import { USER } from '@utils/data';
import type { TUser } from '@utils/types';
import take from 'lodash/take';
import takeRight from 'lodash/takeRight';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useRef } from 'react';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';

import type { TContactPointProfileFormValues } from './components/ContactPointProfileForm/ContactPointProfileForm';
import ContactPointProfileForm from './components/ContactPointProfileForm/ContactPointProfileForm';
import css from './ContactPoint.module.scss';

const ContactPointPage = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const router = useRouter();
  const formSubmitInputRef = useRef<any>();
  const { companyId = '' } = router.query;
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

  const { companyName = '', location = {} } = USER(
    company as TUser,
  ).getPublicData();
  const { email = '' } = USER(company as TUser).getAttributes();
  const { address = '' } = location;

  const { email: bookerEmail = '' } = USER(currentUser).getAttributes();
  const { displayName: bookerDisplayName = '' } =
    USER(currentUser).getProfile();
  const { phoneNumber: bookerPhoneNumber = '' } =
    USER(currentUser).getProtectedData();
  const initialFormValues = useMemo<TContactPointProfileFormValues>(
    () => ({
      displayName: bookerDisplayName,
      email: bookerEmail,
      phoneNumber: bookerPhoneNumber,
    }),
    [bookerDisplayName, bookerEmail, bookerPhoneNumber],
  );
  useEffect(() => {
    const fetchData = async () => {
      dispatch(addWorkspaceCompanyId(companyId));
      await dispatch(BookerManageCompany.companyInfo());
    };
    fetchData();
  }, [companyId, dispatch]);
  const onSubmit = (values: TContactPointProfileFormValues) => {
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
    dispatch(BookerManageCompany.updateBookerAccount(updatedValues));
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
            bookerAccount={currentUser}
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
        <Button className={css.btn} onClick={onSubmitButtonClick}>
          {intl.formatMessage({ id: 'ContactPointPage.submitBtn' })}
        </Button>
      </div>
    </div>
  );
};

export default ContactPointPage;
