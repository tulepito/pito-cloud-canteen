/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';

import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { QuizActions } from '@redux/slices/Quiz.slice';
import { QuizStep } from '@src/utils/enums';

import QuizModal from '../components/QuizModal/QuizModal';
import { useQuizFlow } from '../hooks/useQuizFlow';
import type { TMealStylesFormValues } from '../meal-styles/MealStylesForm';
import MealStylesForm from '../meal-styles/MealStylesForm';

import type { TSpecialDemandFormValues } from './SpecialDemandForm/SpecialDemandForm';
import SpecialDemandForm from './SpecialDemandForm/SpecialDemandForm';

import css from './QuizSpecialDemand.module.scss';

type TQuizSpecialDemandProps = {
  stepInfo?: string;
};

const QuizSpecialDemand: React.FC<TQuizSpecialDemandProps> = ({ stepInfo }) => {
  const intl = useIntl();
  const submittingControl = useBoolean();
  const dispatch = useAppDispatch();
  const formSubmitRef = useRef<any>();
  const [formValues, setFormValues] = useState<
    Partial<TSpecialDemandFormValues & TMealStylesFormValues>
  >({});
  const quizData = useAppSelector((state) => state.Quiz.quiz, shallowEqual);
  const { nextStep, backStep } = useQuizFlow(QuizStep.SPECIAL_DEMAND);

  const fetchAttributesInProgress = useAppSelector(
    (state) => state.SystemAttributes.fetchAttributesInProgress,
  );
  const submitDisabled = useMemo(() => {
    return !formValues?.mealType?.length;
  }, [formValues?.mealType]);

  const handleFormSubmitClick = async () => {
    submittingControl.setTrue();

    try {
      formSubmitRef?.current.submit();
      nextStep();
    } catch (error) {
      console.error(error);
    } finally {
      submittingControl.setFalse();
    }
  };

  const handleFormSubmit = (values: TSpecialDemandFormValues) => {
    dispatch(QuizActions.updateQuiz({ ...values }));
  };

  const handleSkipStep = () => {
    nextStep();
  };

  const specialDemandInitialValues: TSpecialDemandFormValues = useMemo(
    () => ({
      mealType: quizData.mealType || [],
    }),
    [JSON.stringify(quizData.mealType)],
  );
  const mealStyleInitialValues = useMemo(
    () => ({
      mealStyles: quizData.mealStyles || [],
    }),
    [JSON.stringify(quizData.mealStyles)],
  );

  return (
    <QuizModal
      id="QuizSpecialDemand"
      isOpen
      modalTitle={
        <div className={css.headerContainer}>
          <div className={css.main}>
            {intl.formatMessage({
              id: 'QuizSpecialDemand.title',
            })}
          </div>
          <div className={css.semi}>
            (Có thể áp dụng cho 1 hoặc một số khẩu phần)
          </div>
        </div>
      }
      submitText="Tiếp tục"
      cancelText="Tôi chưa chắc"
      onCancel={handleSkipStep}
      onSubmit={handleFormSubmitClick}
      submitDisabled={submitDisabled}
      submitInProgress={submittingControl.value}
      onBack={backStep}
      stepInfo={stepInfo}>
      <div className={css.formContainer}>
        {fetchAttributesInProgress ? (
          <div className={css.loading}>
            {intl.formatMessage({ id: 'QuizMealStyles.loading' })}
          </div>
        ) : (
          <>
            <SpecialDemandForm
              onSubmit={handleFormSubmit}
              formRef={formSubmitRef}
              initialValues={specialDemandInitialValues}
              setFormValues={setFormValues}
            />
            <MealStylesForm
              initialValues={mealStyleInitialValues}
              formValues={formValues}
              setFormValues={setFormValues}
            />
          </>
        )}
      </div>
    </QuizModal>
  );
};

export default QuizSpecialDemand;
