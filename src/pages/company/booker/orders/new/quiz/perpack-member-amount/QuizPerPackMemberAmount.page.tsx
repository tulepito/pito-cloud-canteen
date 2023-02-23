import { FieldTextInputComponent } from '@components/FormFields/FieldTextInput/FieldTextInput';
import { parseThousandNumber } from '@helpers/format';
import {
  greaterThanOneThousand,
  greaterThanZero,
  required,
} from '@utils/validators';
import { useEffect } from 'react';
import { useField, useForm } from 'react-final-form-hooks';
import { useIntl } from 'react-intl';

import QuizModal from '../components/QuizModal/QuizModal';
import css from './QuizPerPackMemberAmount.module.scss';

type TQuizPerPackMemberAmountFormValues = {
  packagePerMember: number;
  memberAmount: number;
};

const VNDIcon = () => {
  return <div className={css.vndIcon}>đ</div>;
};

const Amount = () => {
  return <div className={css.label}>người</div>;
};

const QuizPerPackMemberAmountPage = () => {
  const intl = useIntl();
  const onSubmit = (values: any) => {
    console.log(values);
  };
  const initialValues = {
    packagePerMember: 0,
    memberAmount: 0,
  };

  const validate = (values: TQuizPerPackMemberAmountFormValues) => {
    const errors: any = {};
    const packagePerMemberError =
      required(
        intl.formatMessage({
          id: 'QuizPerPackMemberAmountPage.packagePerMember.required',
        }),
      )(values.packagePerMember.toString()) ||
      greaterThanOneThousand(
        intl.formatMessage({
          id: 'QuizPerPackMemberAmountPage.packagePerMember.greaterThanOneThousand',
        }),
      )(values.packagePerMember);

    if (packagePerMemberError) {
      errors.packagePerMember = packagePerMemberError;
    }
    const memberAmountError =
      required(
        intl.formatMessage({
          id: 'QuizPerPackMemberAmountPage.memberAmount.required',
        }),
      )(values.memberAmount.toString()) ||
      greaterThanZero(
        intl.formatMessage({
          id: 'QuizPerPackMemberAmountPage.memberAmount.greaterThanZero',
        }),
      )(values.memberAmount);
    if (memberAmountError) {
      errors.memberAmount = memberAmountError;
    }
    return errors;
  };

  const { form, hasValidationErrors } =
    useForm<TQuizPerPackMemberAmountFormValues>({
      onSubmit,
      validate,
      initialValues,
    });
  const packagePerMember = useField('packagePerMember', form);
  const memberAmount = useField('memberAmount', form);

  useEffect(() => {
    if (packagePerMember.input.value) {
      form.change(
        'packagePerMember',
        +parseThousandNumber(`${packagePerMember.input.value}`),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packagePerMember.input.value]);
  return (
    <QuizModal
      isOpen
      handleClose={() => {}}
      modalTitle={intl.formatMessage({
        id: 'QuizPerPackMemberAmountPage.title',
      })}
      submitText="Tiếp tục"
      submitDisabled={hasValidationErrors}
      onBack={() => {}}>
      <form className={css.formContainer}>
        <FieldTextInputComponent
          id="packagePerMember"
          name="packagePerMember"
          input={packagePerMember.input}
          meta={packagePerMember.meta}
          label={intl.formatMessage({
            id: 'QuizPerPackMemberAmountPage.packagePerMember.label',
          })}
          placeholder={intl.formatMessage({
            id: 'QuizPerPackMemberAmountPage.packagePerMember.placeholder',
          })}
          type="text"
          className={css.numberInput}
          rightIcon={<VNDIcon />}
        />
        <FieldTextInputComponent
          className={css.inputWrapper}
          id="memberAmount"
          name="memberAmount"
          input={memberAmount.input}
          meta={memberAmount.meta}
          label={intl.formatMessage({
            id: 'QuizPerPackMemberAmountPage.memberAmount.label',
          })}
          rightIconContainerClassName={css.amountLabel}
          rightIcon={<Amount />}
        />
      </form>
    </QuizModal>
  );
};

export default QuizPerPackMemberAmountPage;
