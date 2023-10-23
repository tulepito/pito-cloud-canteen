import { useEffect, useMemo, useState } from 'react';
import { useField, useForm } from 'react-final-form-hooks';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';
import classNames from 'classnames';
import { useRouter } from 'next/router';

import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { QuizActions } from '@redux/slices/Quiz.slice';
import { companyPaths, quizPaths } from '@src/paths';
import type { TKeyValue } from '@src/utils/types';

import useRedirectAfterReloadPage from '../../hooks/useRedirectAfterReloadPage';
import QuizModal from '../components/QuizModal/QuizModal';

import css from './QuizMealStyles.module.scss';

type QuizMealStylesFormValues = {
  mealStyles: string[];
};
const QuizMealStyles = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const submittingControl = useBoolean();

  useRedirectAfterReloadPage();
  const mealStyles = useAppSelector(
    (state) => state.SystemAttributes.categories,
    shallowEqual,
  );
  const fetchMealStylesInProgress = useAppSelector(
    (state) => state.SystemAttributes.fetchAttributesInProgress,
  );
  const quizData = useAppSelector((state) => state.Quiz.quiz, shallowEqual);
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
      await handleSubmit();
      await router.push({
        pathname: quizPaths.MealDates,
        query: { ...router.query },
      });
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
    router.push(quizPaths.MealDates);
  };

  const goBack = () => {
    router.back();
  };

  const handleCancel = () => {
    router.push(companyPaths.Home);
  };

  return (
    <QuizModal
      id="QuizMealStyles"
      isOpen
      handleClose={handleCancel}
      modalTitle={intl.formatMessage({ id: 'QuizMealStyles.title' })}
      submitText="Tiếp tục"
      cancelText="Bỏ qua"
      onCancel={onCancel}
      onSubmit={onFormSubmitClick}
      submitDisabled={hasValidationErrors}
      submitInProgress={submittingControl.value}
      onBack={goBack}>
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
