import FieldTextInput from '@components/FieldTextInput/FieldTextInput';
import Form from '@components/Form/Form';
import classNames from 'classnames';
import React from 'react';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';

import css from './EditCompanyForm.module.scss';

export type TEditCompanyFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  confirmPassword: string;
  companyName: string;
  companyEmail: string;
  companyAddress: string;
  tax: string;
  note?: string;
};

type TEditCompanyForm = {
  onSubmit: (e: TEditCompanyFormValues) => void;
  initialValues?: TEditCompanyFormValues;
  inProgress: boolean;
  createError: any;
  isEditting?: boolean;
};

const EditCompanyForm: React.FC<TEditCompanyForm> = (props) => {
  const intl = useIntl();
  return (
    <FinalForm
      {...props}
      render={(fieldRenderProps: any) => {
        const {
          handleSubmit,
          createError,
          isEditting = false,
        } = fieldRenderProps;
        return (
          <Form onSubmit={handleSubmit} className={css.form}>
            <h3 className={css.formTitle}>
              {intl.formatMessage({
                id: 'EditCompanyForm.personalInformation',
              })}
            </h3>
            <div className={css.fields}>
              <FieldTextInput
                id="firstNname"
                className={css.field}
                name="firstNname"
                label={intl.formatMessage({
                  id: 'EditCompanyForm.firstNameLabel',
                })}
                placeholder={intl.formatMessage({
                  id: 'EditCompanyForm.firstNamePlaceholder',
                })}
              />
              <FieldTextInput
                id="lastName"
                className={css.field}
                name="lastName"
                label={intl.formatMessage({
                  id: 'EditCompanyForm.lastNameLabel',
                })}
                placeholder={intl.formatMessage({
                  id: 'EditCompanyForm.lastNamePlaceholder',
                })}
              />
            </div>
            {!isEditting && (
              <div className={css.fields}>
                <FieldTextInput
                  id="email"
                  name="email"
                  className={css.field}
                  label={intl.formatMessage({
                    id: 'EditCompanyForm.emailLabel',
                  })}
                  placeholder={intl.formatMessage({
                    id: 'EditCompanyForm.emailPlaceholder',
                  })}
                />
              </div>
            )}
            <div className={css.fields}>
              <FieldTextInput
                id="phone"
                className={css.field}
                name="phone"
                label={intl.formatMessage({
                  id: 'EditCompanyForm.phoneLabel',
                })}
                placeholder={intl.formatMessage({
                  id: 'EditCompanyForm.phonePlaceholder',
                })}
              />
              <FieldTextInput
                id="address"
                name="address"
                className={css.field}
                label={intl.formatMessage({
                  id: 'EditCompanyForm.addressLabel',
                })}
                placeholder={intl.formatMessage({
                  id: 'EditCompanyForm.addressPlaceholder',
                })}
              />
            </div>
            {!isEditting && (
              <div className={css.fields}>
                <FieldTextInput
                  id="password"
                  className={css.field}
                  name="password"
                  type="password"
                  label={intl.formatMessage({
                    id: 'EditCompanyForm.passwordLabel',
                  })}
                  placeholder={intl.formatMessage({
                    id: 'EditCompanyForm.passwordPlaceholder',
                  })}
                />
                <FieldTextInput
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  className={css.field}
                  label={intl.formatMessage({
                    id: 'EditCompanyForm.confirmPasswordLabel',
                  })}
                  placeholder={intl.formatMessage({
                    id: 'EditCompanyForm.confirmPasswordPlaceholder',
                  })}
                />
              </div>
            )}
            <h3 className={css.formTitle}>
              {intl.formatMessage({
                id: 'EditCompanyForm.companyInformation',
              })}
            </h3>
            <div className={css.fields}>
              <FieldTextInput
                id="companyName"
                name="companyName"
                label={intl.formatMessage({
                  id: 'EditCompanyForm.companyNameLabel',
                })}
                placeholder={intl.formatMessage({
                  id: 'EditCompanyForm.companyNamePlaceholder',
                })}
                className={css.field}
              />
              <FieldTextInput
                id="companyEmail"
                name="companyEmail"
                className={css.field}
                label={intl.formatMessage({
                  id: 'EditCompanyForm.companyEmailLabel',
                })}
                placeholder={intl.formatMessage({
                  id: 'EditCompanyForm.companyEmailPlaceholder',
                })}
              />
            </div>
            <div className={css.fields}>
              <FieldTextInput
                id="companyAddress"
                className={css.field}
                name="companyAddress"
                label={intl.formatMessage({
                  id: 'EditCompanyForm.companyAddressLabel',
                })}
                placeholder={intl.formatMessage({
                  id: 'EditCompanyForm.companyAddressPlaceholder',
                })}
              />
              <FieldTextInput
                id="tax"
                name="tax"
                className={css.field}
                label={intl.formatMessage({
                  id: 'EditCompanyForm.taxLabel',
                })}
                placeholder={intl.formatMessage({
                  id: 'EditCompanyForm.taxPlaceholder',
                })}
              />
            </div>
            <div className={css.fields}>
              <FieldTextInput
                id="note"
                className={classNames(css.field, css.textareaField)}
                name="note"
                type="textarea"
                label={intl.formatMessage({
                  id: 'EditCompanyForm.noteLabel',
                })}
              />
            </div>
            <div className={css.buttonWrapper}>
              {createError && (
                <p className={css.error}>{createError.message}</p>
              )}
              <button className={css.button}>
                {intl.formatMessage({
                  id: 'EditCompanyForm.add',
                })}
              </button>
            </div>
          </Form>
        );
      }}
    />
  );
};

export default EditCompanyForm;
