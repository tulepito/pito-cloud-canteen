import { useAppDispatch, useAppSelector } from '@redux/reduxHooks';
import { createCompanyPageThunks } from '@redux/slices/CreateCompanyPage.slice';

import type { TEditCompanyFormValues } from '../components/EditCompanyForm/EditCompanyForm';
import EditCompanyForm from '../components/EditCompanyForm/EditCompanyForm';

export default function CreateCompanyPage() {
  const dispatch = useAppDispatch();

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
  return (
    <EditCompanyForm
      onSubmit={onSubmit}
      inProgress={createCompanyInProgress}
      createError={createCompanyError}
    />
  );
}
