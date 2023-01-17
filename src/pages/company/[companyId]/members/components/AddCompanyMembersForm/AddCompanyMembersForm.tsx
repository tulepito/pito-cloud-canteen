import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import IconClose from '@components/Icons/IconClose/IconClose';
import { USER } from '@utils/data';
import { emailFormatValid } from '@utils/validators';
import difference from 'lodash/difference';
import fill from 'lodash/fill';
import { useState } from 'react';
import type { FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';

import css from './AddCompanyMembersForm.module.scss';

export type TAddCompanyMembersFormValues = {};
type AddCompanyMembersFormProps = {
  onSubmit: (values: TAddCompanyMembersFormValues) => void;
  initialValues: TAddCompanyMembersFormValues;
  emailList: string[];
  setEmailList: (value: string[]) => void;
  loadedResult: any[];
  emailCheckingInProgress: boolean;
  checkInputEmailValue: (value: string[]) => void;
  companyAccount: any;
  removeEmailValue: (email: string) => void;
  addMembersInProgress: boolean;
  addMembersError: any;
};

const AddCompanyMembersForm: React.FC<AddCompanyMembersFormProps> = (props) => {
  const {
    emailList,
    setEmailList,
    loadedResult,
    emailCheckingInProgress = false,
    checkInputEmailValue,
    removeEmailValue,
    addMembersInProgress = false,
    addMembersError,
  } = props;
  const intl = useIntl();
  const [loadingRow, setLoadingRow] = useState<number>(0);
  return (
    <FinalForm
      {...props}
      render={(formRenderProps: FormRenderProps) => {
        const { handleSubmit, form } = formRenderProps;

        const emailInvalidMessage = intl.formatMessage({
          id: 'AddCompanyMembersForm.emailInvalid',
        });

        const submitDisabled =
          loadedResult.length === 0 || addMembersInProgress;
        const handleEmailFieldBlur = (event: any) => {
          const { value } = event.target;
          if (!value) {
            return;
          }
          const emailListValue = value.split(',');
          setLoadingRow(emailListValue.length);
          const formatListEmailValue = emailListValue.reduce(
            (result: string[], separatedEmail: string) => {
              const isEmailInValid = emailFormatValid(emailInvalidMessage)(
                separatedEmail.trim(),
              );
              return isEmailInValid
                ? result
                : new Set([...result, separatedEmail.trim().toLowerCase()]);
            },
            [],
          );
          const newEmailList = Array.from(
            new Set([...emailList, ...formatListEmailValue]),
          );
          setEmailList(newEmailList);
          form.change('emailList', '');
          checkInputEmailValue(
            difference(Array.from(formatListEmailValue), emailList),
          );
        };
        const handleKeyDown = (event: any) => {
          if (event.key === 'Enter' || event.keyCode === 32) {
            event.preventDefault();
            handleEmailFieldBlur(event);
          }
        };
        return (
          <Form onSubmit={handleSubmit}>
            <FieldTextInput
              id="emailList"
              name="emailList"
              rootClassName={css.fieldInput}
              placeholder={intl.formatMessage({
                id: 'AddCompanyMembersForm.emailListPlaceholder',
              })}
              onBlur={handleEmailFieldBlur}
              onKeyDown={handleKeyDown}
            />
            <div className={css.loadedResult}>
              {loadedResult.map((record, index: number) => {
                const hasNoAccount = record.response?.statusCode === 404;
                const onDeleteUser = () => {
                  removeEmailValue(record.email);
                };
                return (
                  <div key={index} className={css.memberItem}>
                    <div className={css.memberWrapper}>
                      <div className={css.grayCircle} />
                      {hasNoAccount ? (
                        <div className={css.fullRowEmail}>{record.email}</div>
                      ) : (
                        <div>
                          <div className={css.name}>
                            {USER(record.response).getProfile().displayName}
                          </div>
                          <div className={css.email}>{record.email}</div>
                        </div>
                      )}
                    </div>
                    <div className={css.actionsWrapper}>
                      <IconClose
                        className={css.closeIcon}
                        onClick={onDeleteUser}
                      />
                    </div>
                  </div>
                );
              })}
              {emailCheckingInProgress &&
                fill(Array(loadingRow), 0).map((_: any, index: number) => (
                  <div key={index} className={css.skeletonWrapper}></div>
                ))}
            </div>
            {addMembersError && (
              <div className={css.error}>{addMembersError}</div>
            )}
            <Button
              type="submit"
              className={css.submitBtn}
              disabled={submitDisabled}
              inProgress={addMembersInProgress}
              tabIndex={-1}>
              {intl.formatMessage({
                id: 'AddCompanyMembersForm.addMembersSubmit',
              })}
            </Button>
          </Form>
        );
      }}
    />
  );
};
export default AddCompanyMembersForm;
