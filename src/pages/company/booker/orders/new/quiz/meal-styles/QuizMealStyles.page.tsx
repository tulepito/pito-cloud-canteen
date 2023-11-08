import { useEffect, useMemo, useState } from 'react';
import { useField, useForm } from 'react-final-form-hooks';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';
import classNames from 'classnames';

import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { QuizActions } from '@redux/slices/Quiz.slice';
import { QuizStep } from '@src/utils/enums';
import type { TKeyValue } from '@src/utils/types';

import QuizModal from '../components/QuizModal/QuizModal';
import { useQuizFlow } from '../hooks/useQuizFlow';

import css from './QuizMealStyles.module.scss';

type QuizMealStylesFormValues = {
  mealStyles: string[];
};
const QuizMealStyles = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const submittingControl = useBoolean();

  const mealStyles = useAppSelector(
    (state) => state.SystemAttributes.categories,
    shallowEqual,
  );
  const fetchMealStylesInProgress = useAppSelector(
    (state) => state.SystemAttributes.fetchAttributesInProgress,
  );
  const quizData = useAppSelector((state) => state.Quiz.quiz, shallowEqual);
  const { nextStep, backStep } = useQuizFlow(QuizStep.MEAL_STYLES);
  const [selectedMealStyles, setSelectedMealStyles] = useState<string[]>(
    quizData.mealStyles || [],
  );

  const validate = (values: QuizMealStylesFormValues) => {
    const errors: any = {};
    if (!values.mealStyles || values.mealStyles.length < 5) {
      errors.mealStyles = intl.formatMessage({ id: 'QuizMealStyles.error' });
    }

    return errors;
  };
  const initialValues = useMemo(
    () => ({
      mealStyles: quizData.mealStyles || [],
    }),
    [quizData.mealStyles],
  );

  const { handleSubmit, form, hasValidationErrors } =
    useForm<QuizMealStylesFormValues>({
      onSubmit: (values) => {
        dispatch(QuizActions.updateQuiz({ ...values }));
      },
      validate,
      initialValues,
    });
  const mealStylesInput = useField('mealStyles', form);
  const onSelectMealStyle = (mealStyle: string) => () => {
    if (selectedMealStyles.includes(mealStyle)) {
      setSelectedMealStyles(
        selectedMealStyles.filter((item) => item !== mealStyle),
      );
    } else {
      setSelectedMealStyles([...selectedMealStyles, mealStyle]);
    }
  };
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

  useEffect(() => {
    form.change('mealStyles', selectedMealStyles);
  }, [form, selectedMealStyles, selectedMealStyles.length]);

  const onCancel = () => {
    nextStep();
  };

  return (
    <QuizModal
      id="QuizMealStyles"
      isOpen
      modalTitle={intl.formatMessage({ id: 'QuizMealStyles.title' })}
      submitText="Tiếp tục"
      cancelText="Bỏ qua"
      onCancel={onCancel}
      onSubmit={onFormSubmitClick}
      submitDisabled={hasValidationErrors}
      submitInProgress={submittingControl.value}
      onBack={backStep}>
      <div className={css.formContainer}>
        {fetchMealStylesInProgress ? (
          <div className={css.loading}>
            {intl.formatMessage({ id: 'QuizMealStyles.loading' })}
          </div>
        ) : (
          <form className={css.form}>
            <input
              {...mealStylesInput.input}
              type="hidden"
              id="mealStyles"
              name="mealStyles"
            />
            {mealStyles.map((mealStyle: TKeyValue) => (
              <div
                key={mealStyle.key}
                className={classNames(css.item, {
                  [css.selected]: selectedMealStyles.includes(mealStyle.key),
                })}
                onClick={onSelectMealStyle(mealStyle.key)}>
                {mealStyle.label}
              </div>
            ))}
          </form>
        )}
      </div>
    </QuizModal>
  );
};

export default QuizMealStyles;
