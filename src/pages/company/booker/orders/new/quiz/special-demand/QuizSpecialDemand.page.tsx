/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';
import isEmpty from 'lodash/isEmpty';

import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
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
  const dispatch = useAppDispatch();

  const quizData = useAppSelector((state) => state.Quiz.quiz, shallowEqual);
  const { nextStep, backStep } = useQuizFlow(QuizStep.SPECIAL_DEMAND);
  const [formValues, setFormValues] = useState<
    Partial<TSpecialDemandFormValues & TMealStylesFormValues>
  >({});
  const fetchAttributesInProgress = useAppSelector(
    (state) => state.SystemAttributes.fetchAttributesInProgress,
  );

  const submitDisabled = useMemo(() => {
    const { mealType, mealStyles = [] } = formValues;

    return isEmpty(mealType) || mealStyles.length < 5;
  }, [JSON.stringify(formValues)]);

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

  const handleFormSubmitClick = () => {
    dispatch(QuizActions.updateQuiz(formValues));
    nextStep();
  };

  const handleSkipStep = () => {
    nextStep();
  };

  useEffect(
    () =>
      setFormValues({
        mealType: quizData.mealType || [],
        mealStyles: quizData.mealStyles || [],
      }),
    [JSON.stringify(quizData)],
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
              onSubmit={() => {}}
              initialValues={specialDemandInitialValues}
              formValues={formValues}
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
