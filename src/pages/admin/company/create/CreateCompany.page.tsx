import { createCompanyPageThunks } from '@redux/slices/CreateCompanyPage.slice';
import { isSignupEmailTakenError } from '@utils/errors';
import { useIntl } from 'react-intl';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import type { TEditCompanyFormValues } from '../components/EditCompanyForm/EditCompanyForm';
import EditCompanyForm from '../components/EditCompanyForm/EditCompanyForm';
import css from './CreateCompany.module.scss';

export default function CreateCompanyPage() {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const { createCompanyInProgress, createCompanyError } = useAppSelector(
    (state) => state.CreateCompanyPage,
  );

  const onSubmit = (values: TEditCompanyFormValues) => {
    const companyData = {
      email: values.email,
      password: values.password,
      firstName: values.firstName,
      lastName: values.lastName,
      displayName: `${values.firstName} ${values.lastName}`,
      publicData: {
        address: values.address,
        companyAddress: values.companyAddress,
        companyName: values.companyName,
        companyEmail: values.companyEmail,
        phoneNumber: values.phone,
        note: values.note,
      },
      privateData: {
        tax: values.tax,
      },
    };
    dispatch(
      createCompanyPageThunks.creatCompany({
        dataParams: companyData,
        queryParams: { expand: true },
      }),
    );
  };

  const formErrorMessage = isSignupEmailTakenError(createCompanyError)
    ? intl.formatMessage({
        id: 'CreateCompanyPage.createCompanyEmailAlreadyTaken',
      })
    : intl.formatMessage({
        id: 'CreateCompanyPage.createCompanyFailed',
      });

  return (
    <div className={css.root}>
      <EditCompanyForm
        onSubmit={onSubmit}
        inProgress={createCompanyInProgress}
        formErrorMessage={createCompanyError ? formErrorMessage : null}
      />
    </div>
  );
}
