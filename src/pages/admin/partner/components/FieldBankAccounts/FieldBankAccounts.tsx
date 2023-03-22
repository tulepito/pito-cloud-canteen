import React, { Fragment } from 'react';
import { FieldArray } from 'react-final-form-arrays';
import { useIntl } from 'react-intl';
import classNames from 'classnames';

import { InlineTextButton } from '@components/Button/Button';
import FieldCheckbox from '@components/FormFields/FieldCheckbox/FieldCheckbox';
import FieldSelect from '@components/FormFields/FieldSelect/FieldSelect';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import IconAdd from '@components/Icons/IconAdd/IconAdd';
import IconDelete from '@components/Icons/IconDelete/IconDelete';
import { LIST_BANKS } from '@utils/enums';
import {
  composeValidators,
  numberMinLength,
  required,
} from '@utils/validators';

import css from './FieldBankAccounts.module.scss';

type TFieldBankAccounts = {
  id: string;
  name: string;
  className?: string;
};

const FieldBankAccounts: React.FC<TFieldBankAccounts> = (props) => {
  const { id, name, className } = props;
  const intl = useIntl();

  return (
    <FieldArray name={name} id={id}>
      {({ fields }: any) => {
        const addNewItem = () => {
          fields.push({
            bankId: '',
            bankAgency: '',
            bankAccountNumber: '',
            bankOwnerName: '',
            isDefault: false,
          });
        };

        const removeItem = (index: number) => () => {
          fields.remove(index);
        };

        const onCheckboxChange = (index: number) => () => {
          fields.value.forEach((value: any, valueIndex: number) => {
            if (value.isDefault) {
              fields.update(valueIndex, {
                ...fields.value[valueIndex],
                isDefault: false,
              });
            }
          });
          fields.update(index, {
            ...fields.value[index],
            isDefault: true,
          });
        };

        // eslint-disable-next-line @typescript-eslint/no-shadow
        return (
          <div className={classNames(css.root, className)}>
            {fields.map((fieldName: string, index: number) => {
              return (
                <Fragment key={fieldName}>
                  <div className={css.bankItem} key={fieldName}>
                    <FieldSelect
                      key={fieldName}
                      className={css.field}
                      label={intl.formatMessage({
                        id: 'FieldBankAccounts.bankIdNumber',
                      })}
                      id={`${fieldName}.bankId`}
                      name={`${fieldName}.bankId`}
                      required
                      validate={required(
                        intl.formatMessage({
                          id: 'FieldBankAccounts.bankIdRequired',
                        }),
                      )}>
                      <option disabled value="">
                        {intl.formatMessage({
                          id: 'FieldBankAccounts.bankIdlaceholder',
                        })}
                      </option>
                      {LIST_BANKS.map((option: any) => (
                        <option key={option.key} value={option.key}>
                          {option.label}
                        </option>
                      ))}
                    </FieldSelect>
                    <FieldTextInput
                      className={css.field}
                      label={intl.formatMessage({
                        id: 'FieldBankAccounts.bankAgencyLabel',
                      })}
                      placeholder={intl.formatMessage({
                        id: 'FieldBankAccounts.bankAgencyPlaceholder',
                      })}
                      id={`${fieldName}.bankAgency`}
                      name={`${fieldName}.bankAgency`}
                      validate={required(
                        intl.formatMessage({
                          id: 'FieldBankAccounts.bankAgencyRequired',
                        }),
                      )}
                      required
                    />
                    <FieldTextInput
                      className={css.field}
                      type="number"
                      label={intl.formatMessage({
                        id: 'FieldBankAccounts.bankAccountNumberLabel',
                      })}
                      placeholder={intl.formatMessage({
                        id: 'FieldBankAccounts.bankAccountNumberPlaceholder',
                      })}
                      id={`${fieldName}.bankAccountNumber`}
                      name={`${fieldName}.bankAccountNumber`}
                      validate={composeValidators(
                        required(
                          intl.formatMessage({
                            id: 'FieldBankAccounts.bankAccountNumberRequired',
                          }),
                        ),
                        numberMinLength(
                          intl.formatMessage({
                            id: 'FieldBankAccounts.bankAccountNumberInvalid',
                          }),
                          0,
                        ),
                      )}
                      required
                    />
                    <FieldTextInput
                      className={css.field}
                      label={intl.formatMessage({
                        id: 'FieldBankAccounts.bankOwnerNameLabel',
                      })}
                      placeholder={intl.formatMessage({
                        id: 'FieldBankAccounts.bankOwnerNamePlaceholder',
                      })}
                      id={`${fieldName}.bankOwnerName`}
                      name={`${fieldName}.bankOwnerName`}
                      validate={required(
                        intl.formatMessage({
                          id: 'FieldBankAccounts.bankOwnerNameRequired',
                        }),
                      )}
                      required
                    />
                    <div className={css.bankWidgets}>
                      <FieldCheckbox
                        name={`${fieldName}.isDefault`}
                        id={`${fieldName}.isDefault`}
                        label={intl.formatMessage({
                          id: 'FieldBankAccounts.bankAccountSetDefault',
                        })}
                        customOnChange={onCheckboxChange(index)}
                      />
                      {index !== 0 && (
                        <InlineTextButton
                          type="button"
                          onClick={removeItem(index)}
                          className={css.deleteButton}>
                          <IconDelete className={css.deleteIcon} />
                        </InlineTextButton>
                      )}
                    </div>
                  </div>
                  {index === fields.length - 1 && (
                    <InlineTextButton
                      onClick={addNewItem}
                      type="button"
                      className={css.bankItem}>
                      <IconAdd />
                      <p>
                        {intl.formatMessage({
                          id: 'FieldBankAccounts.addNewAccount',
                        })}
                      </p>
                    </InlineTextButton>
                  )}
                </Fragment>
              );
            })}
          </div>
        );
      }}
    </FieldArray>
  );
};

export default FieldBankAccounts;
