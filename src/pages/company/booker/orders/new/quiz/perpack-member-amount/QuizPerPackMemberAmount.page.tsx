/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo } from 'react';
import { useField, useForm } from 'react-final-form-hooks';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';
import { useRouter } from 'next/router';

import { FieldTextInputComponent } from '@components/FormFields/FieldTextInput/FieldTextInput';
import { parseThousandNumber } from '@helpers/format';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { QuizActions } from '@redux/slices/Quiz.slice';
import { companyPaths } from '@src/paths';
import { QuizStep } from '@src/utils/enums';
import {
  greaterThanOneThousand,
  greaterThanZero,
  required,
} from '@utils/validators';

import QuizModal from '../components/QuizModal/QuizModal';
import { useQuizFlow } from '../hooks/useQuizFlow';

import css from './QuizPerPackMemberAmount.module.scss';

type TQuizPerPackMemberAmountFormValues = {
  packagePerMember: string;
  memberAmount: string;
};

const VNDIcon = () => {
  return <div className={css.vndIcon}>đ</div>;
};

const Amount = () => {
  return <div className={css.label}>người</div>;
};

type TQuizPerPackMemberAmountPageProps = {
  stepInfo?: string;
  firstTimeOrder?: boolean;
};
const QuizPerPackMemberAmountPage: React.FC<
  TQuizPerPackMemberAmountPageProps
> = ({ stepInfo, firstTimeOrder }) => {
  const intl = useIntl();
  const router = useRouter();
  const submittingControl = useBoolean();
  const dispatch = useAppDispatch();

  const quizData = useAppSelector((state) => state.Quiz.quiz, shallowEqual);
  const { nextStep } = useQuizFlow(QuizStep.PACKAGE_PER_MEMBER);

  const onSubmit = async (values: any) => {
    const {
      packagePerMember: packagePerMemberValue,
      memberAmount: memberAmountValue,
    } = values;
    await dispatch(
      QuizActions.updateQuiz({
        packagePerMember: parseInt(
          packagePerMemberValue?.replace(/,/g, '') || 0,
          10,
        ),
        memberAmount: +memberAmountValue || 0,
      }),
    );
  };
  const initialValues = useMemo(
    () => ({
      packagePerMember: quizData.packagePerMember?.toString(),
      memberAmount: quizData.memberAmount?.toString(),
    }),
    [quizData.memberAmount, quizData.packagePerMember],
  );

  const validate = (values: TQuizPerPackMemberAmountFormValues) => {
    const errors: any = {};
    const packagePerMemberError =
      required(
        intl.formatMessage({
          id: 'QuizPerPackMemberAmountPage.packagePerMember.required',
        }),
      )(values.packagePerMember?.toString()) ||
      greaterThanOneThousand(
        intl.formatMessage({
          id: 'QuizPerPackMemberAmountPage.packagePerMember.greaterThanOneThousand',
        }),
      )(+values.packagePerMember);

    if (packagePerMemberError) {
      errors.packagePerMember = packagePerMemberError;
    }
    const memberAmountError =
      required(
        intl.formatMessage({
          id: 'QuizPerPackMemberAmountPage.memberAmount.required',
        }),
      )(values.memberAmount?.toString()) ||
      greaterThanZero(
        intl.formatMessage({
          id: 'QuizPerPackMemberAmountPage.memberAmount.greaterThanZero',
        }),
      )(+values.memberAmount);
    if (memberAmountError) {
      errors.memberAmount = memberAmountError;
    }

    return errors;
  };

  const { form, hasValidationErrors, handleSubmit } =
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
        parseThousandNumber(`${packagePerMember.input.value}`),
      );
    }
  }, [packagePerMember.input.value]);

  useEffect(() => {
    if (memberAmount.input.value) {
      form.change(
        'memberAmount',
        parseThousandNumber(`${memberAmount.input.value}`),
      );
    }
  }, [memberAmount.input.value]);

  const onFormSubmitClick = async () => {
    submittingControl.setTrue();

    try {
      handleSubmit();
      nextStep();
    } catch (error) {
      console.error(error);
    } finally {
      submittingControl.setFalse();
    }
  };

  const handleCancel = () => {
    router.push(companyPaths.Home);
  };

  return (
    <QuizModal
      id="QuizPerPackMemberAmountModal"
      isOpen
      handleClose={handleCancel}
      modalTitle={intl.formatMessage({
        id: 'QuizPerPackMemberAmountPage.title',
      })}
      submitText="Tiếp tục"
      submitDisabled={hasValidationErrors}
      submitInProgress={submittingControl.value}
      onSubmit={onFormSubmitClick}
      stepInfo={stepInfo}
      firstTimeOrder={firstTimeOrder}>
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
          placeholder="0"
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
