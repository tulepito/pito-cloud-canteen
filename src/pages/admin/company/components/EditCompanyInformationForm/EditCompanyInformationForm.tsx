import type { MutableRefObject } from 'react';
import { useImperativeHandle } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import type { FormApi } from 'final-form';

import Form from '@components/Form/Form';
import FieldTextArea from '@components/FormFields/FieldTextArea/FieldTextArea';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import { LocationAutocompleteInputField } from '@components/LocationAutocompleteInput/LocationAutocompleteInput';
import type { TObject } from '@utils/types';
import {
  autocompletePlaceSelected,
  autocompleteSearchRequired,
  composeValidators,
  composeValidatorsWithAllValues,
  confirmPassword,
  emailFormatValid,
  passwordFormatValid,
  phoneNumberFormatValid,
  required,
} from '@utils/validators';

import css from './EditCompanyInformationForm.module.scss';

export type TEditCompanyInformationFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  location: TObject;
  tax: string;
  password: string;
  confirmPassword: string;
  note: string;
  phoneNumber: string;
  companyName: string;
  companyEmail: string;
  companyLocation: TObject;
};

type TExtraProps = {
  isEditting: boolean;
  formRef: MutableRefObject<FormApi<TEditCompanyInformationFormValues>>;
};
type TEditCompanyInformationFormComponentProps =
  FormRenderProps<TEditCompanyInformationFormValues> & Partial<TExtraProps>;
type TEditCompanyInformationFormProps =
  FormProps<TEditCompanyInformationFormValues> & TExtraProps;

const EditCompanyInformationFormComponent: React.FC<
  TEditCompanyInformationFormComponentProps
> = (props) => {
  const { handleSubmit, isEditting = false, formRef, form } = props;

  const intl = useIntl();

  useImperativeHandle(formRef, () => form);

  return (
    <Form onSubmit={handleSubmit} className={css.form}>
      <h3 className={css.formTitle}>
        {intl.formatMessage({
          id: 'EditCompanyForm.personalInformation',
        })}
      </h3>
      <div className={css.fields}>
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
          validate={required(
            intl.formatMessage({
              id: 'EditCompanyForm.lastNameRequired',
            }),
          )}
          required
        />
        <FieldTextInput
          id="firstName"
          className={css.field}
          name="firstName"
          label={intl.formatMessage({
            id: 'EditCompanyForm.firstNameLabel',
          })}
          placeholder={intl.formatMessage({
            id: 'EditCompanyForm.firstNamePlaceholder',
          })}
          validate={required(
            intl.formatMessage({
              id: 'EditCompanyForm.firstNameRequired',
            }),
          )}
          required
        />
        {!isEditting && (
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
            validate={composeValidators(
              required(
                intl.formatMessage({
                  id: 'EditCompanyForm.emailRequired',
                }),
              ),
              emailFormatValid(
                intl.formatMessage({
                  id: 'EditCompanyForm.emailInvalid',
                }),
              ),
            )}
            required
          />
        )}
        <FieldTextInput
          id="phoneNumber"
          className={css.field}
          name="phoneNumber"
          label={intl.formatMessage({
            id: 'EditCompanyForm.phoneLabel',
          })}
          placeholder={intl.formatMessage({
            id: 'EditCompanyForm.phonePlaceholder',
          })}
          validate={composeValidators(
            required(
              intl.formatMessage({
                id: 'EditCompanyForm.phoneRequired',
              }),
            ),
            phoneNumberFormatValid(
              intl.formatMessage({
                id: 'EditCompanyForm.phoneInValid',
              }),
            ),
          )}
          required
        />
        <LocationAutocompleteInputField
          id="location"
          name="location"
          rootClassName={css.field}
          label={intl.formatMessage({
            id: 'EditCompanyForm.addressLabel',
          })}
          placeholder={intl.formatMessage({
            id: 'EditCompanyForm.addressPlaceholder',
          })}
          validate={autocompletePlaceSelected(
            intl.formatMessage({
              id: 'EditCompanyForm.validLocation',
            }),
          )}
        />
        {!isEditting && (
          <>
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
              validate={composeValidators(
                required(
                  intl.formatMessage({
                    id: 'EditCompanyForm.passwordRequired',
                  }),
                ),
                passwordFormatValid(
                  intl.formatMessage({
                    id: 'EditCompanyForm.passwordInvalid',
                  }),
                ),
              )}
              required
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
              validate={composeValidatorsWithAllValues(
                required(
                  intl.formatMessage({
                    id: 'EditCompanyForm.confirmPasswordRequired',
                  }),
                ),
                confirmPassword(
                  intl.formatMessage({
                    id: 'EditCompanyForm.confirmPasswordInvalid',
                  }),
                  'password',
                ),
              )}
              required
            />
          </>
        )}
      </div>
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
          validate={required(
            intl.formatMessage({
              id: 'EditCompanyForm.companyNameLabelRequired',
            }),
          )}
          required
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
          validate={emailFormatValid(
            intl.formatMessage({
              id: 'EditCompanyForm.companyEmailInvalid',
            }),
          )}
        />
        <LocationAutocompleteInputField
          id="companyLocation"
          name="companyLocation"
          rootClassName={css.field}
          label={intl.formatMessage({
            id: 'EditCompanyForm.addressLabel',
          })}
          placeholder={intl.formatMessage({
            id: 'EditCompanyForm.addressPlaceholder',
          })}
          validate={composeValidators(
            autocompleteSearchRequired(
              intl.formatMessage({
                id: 'EditCompanyForm.locationRequried',
              }),
            ),
            autocompletePlaceSelected(
              intl.formatMessage({
                id: 'EditCompanyForm.validLocation',
              }),
            ),
          )}
          required
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
        <FieldTextArea
          id="note"
          className={classNames(css.field, css.textareaField)}
          name="note"
          type="textarea"
          label={intl.formatMessage({
            id: 'EditCompanyForm.noteLabel',
          })}
          placeholder={intl.formatMessage({
            id: 'EditCompanyForm.notePlaceholder',
          })}
        />
      </div>
    </Form>
  );
};

const EditCompanyInformationForm: React.FC<TEditCompanyInformationFormProps> = (
  props,
) => {
  return (
    <FinalForm {...props} component={EditCompanyInformationFormComponent} />
  );
};

export default EditCompanyInformationForm;
