import Button from '@components/Button/Button';
import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import FieldTextInput from '@components/FieldTextInput/FieldTextInput';
import Form from '@components/Form/Form';
import { LocationAutocompleteInputField } from '@components/LocationAutocompleteInput/LocationAutocompleteInput';
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
import classNames from 'classnames';
import isEqual from 'lodash/isEqual';
import React, { useState } from 'react';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';

import css from './EditCompanyForm.module.scss';

export type TEditCompanyFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: any;
  password: string;
  confirmPassword: string;
  companyName: string;
  companyEmail: string;
  companyLocation: any;
  tax: string;
  note?: string;
};

type TEditCompanyForm = {
  onSubmit: (e: TEditCompanyFormValues) => void;
  initialValues?: TEditCompanyFormValues;
  inProgress: boolean;
  formErrorMessage?: string | null;
  isEditting?: boolean;
};

const EditCompanyForm: React.FC<TEditCompanyForm> = (props) => {
  const intl = useIntl();
  const { onSubmit, ...rest } = props;
  const [submitedValues, setSubmittedValues] =
    useState<TEditCompanyFormValues>();
  const [success, setSuccess] = useState<boolean>(false);

  const submitHandler = async (values: TEditCompanyFormValues) => {
    try {
      const response = (await onSubmit(values)) as any;
      if (!response.error) {
        setSuccess(true);
        const i = setTimeout(() => {
          setSubmittedValues(values);
          setSuccess(false);
          clearTimeout(i);
        }, 5000);
      }
    } catch (error) {
      // don't do any thing
    }
  };
  return (
    <FinalForm
      {...rest}
      onSubmit={submitHandler}
      render={(fieldRenderProps: any) => {
        const {
          handleSubmit,
          formErrorMessage,
          isEditting = false,
          inProgress,
          values,
        } = fieldRenderProps;

        const ready =
          (!formErrorMessage && isEqual(submitedValues, values)) || success;

        return (
          <Form onSubmit={handleSubmit} className={css.form}>
            <div className={css.formHeader}>
              <p>
                {intl.formatMessage({
                  id: 'EditCompanyForm.formHeader',
                })}
              </p>
            </div>
            <p className={css.formTitle}>
              {intl.formatMessage({
                id: 'EditCompanyForm.personalInformation',
              })}
            </p>
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
              </div>
            )}
            <p className={css.formTitle}>
              {intl.formatMessage({
                id: 'EditCompanyForm.companyInformation',
              })}
            </p>
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
                validate={composeValidators(
                  required(
                    intl.formatMessage({
                      id: 'EditCompanyForm.companyEmailRequired',
                    }),
                  ),
                  emailFormatValid(
                    intl.formatMessage({
                      id: 'EditCompanyForm.companyEmailInvalid',
                    }),
                  ),
                )}
                required
              />
            </div>
            <div className={css.fields}>
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
                validate={required(
                  intl.formatMessage({
                    id: 'EditCompanyForm.taxRequired',
                  }),
                )}
                required
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
              <div>
                {ready && (
                  <span className={css.successMessage}>
                    {isEditting
                      ? intl.formatMessage({
                          id: 'EditCompanyForm.updateSuccess',
                        })
                      : intl.formatMessage({
                          id: 'EditCompanyForm.createSuccess',
                        })}
                  </span>
                )}
                {formErrorMessage && (
                  <ErrorMessage message={formErrorMessage} />
                )}
              </div>
              <Button
                inProgress={inProgress}
                disabled={inProgress}
                ready={ready}
                className={css.button}>
                {isEditting
                  ? intl.formatMessage({
                      id: 'EditCompanyForm.update',
                    })
                  : intl.formatMessage({
                      id: 'EditCompanyForm.add',
                    })}
              </Button>
            </div>
          </Form>
        );
      }}
    />
  );
};

export default EditCompanyForm;
