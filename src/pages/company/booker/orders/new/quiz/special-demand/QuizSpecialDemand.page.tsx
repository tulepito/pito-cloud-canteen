/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';
import { useRouter } from 'next/router';

import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { QuizActions } from '@redux/slices/Quiz.slice';
import { companyPaths, quizPaths } from '@src/paths';
import { User } from '@src/utils/data';

import useRedirectAfterReloadPage from '../../hooks/useRedirectAfterReloadPage';
import QuizModal from '../components/QuizModal/QuizModal';

import type { TSpecialDemandFormValues } from './SpecialDemandForm/SpecialDemandForm';
import SpecialDemandForm from './SpecialDemandForm/SpecialDemandForm';

import css from './QuizSpecialDemand.module.scss';

const QuizSpecialDemand = () => {
  const intl = useIntl();
  const router = useRouter();
  const submittingControl = useBoolean();
  const dispatch = useAppDispatch();
  useRedirectAfterReloadPage();
  const formSubmitRef = useRef<any>();
  const [formValues, setFormValues] = useState<TSpecialDemandFormValues>();
  const quizData = useAppSelector((state) => state.Quiz.quiz, shallowEqual);
  const selectedCompany = useAppSelector(
    (state) => state.Quiz.selectedCompany,
    shallowEqual,
  );
  const nutritionsOptions = useAppSelector(
    (state) => state.SystemAttributes.nutritions,
    shallowEqual,
  );
  const fetchAttributesInProgress = useAppSelector(
    (state) => state.SystemAttributes.fetchAttributesInProgress,
  );
  const submitDisabled = useMemo(() => {
    return !formValues?.nutritions?.length && !formValues?.mealType?.length;
  }, [formValues?.nutritions, formValues?.mealType]);

  const { nutritions } = User(selectedCompany).getPublicData();
  const handleFormSubmitClick = async () => {
    submittingControl.setTrue();

    try {
      await formSubmitRef?.current.submit();
      await router.push({
        pathname: quizPaths.MealStyles,
        query: { ...router.query },
      });
    } catch (error) {
      console.error(error);
    } finally {
      submittingControl.setFalse();
    }
  };

  const onFormSubmit = async (values: TSpecialDemandFormValues) => {
    await dispatch(QuizActions.updateQuiz({ ...values }));
  };

  const onCancel = () => {
    router.push(quizPaths.MealStyles);
  };

  const goBack = () => {
    router.back();
  };

  const initialValues: TSpecialDemandFormValues = useMemo(
    () => ({
      nutritions: quizData.nutritions || nutritions || [],
      mealType: quizData.mealType || [],
    }),
    [
      JSON.stringify(quizData.nutritions),
      JSON.stringify(quizData.mealType),
      JSON.stringify(nutritions),
    ],
  );

  const handleCancel = () => {
    router.push(companyPaths.Home);
  };

  return (
    <QuizModal
      id="QuizSpecialDemand"
      isOpen
      handleClose={handleCancel}
      modalTitle={intl.formatMessage({
        id: 'QuizSpecialDemand.title',
      })}
      submitText="Tiếp tục"
      cancelText="Bỏ qua"
      onCancel={onCancel}
      onSubmit={handleFormSubmitClick}
      submitDisabled={submitDisabled}
      submitInProgress={submittingControl.value}
      onBack={goBack}>
      <div className={css.formContainer}>
        {fetchAttributesInProgress ? (
          <div className={css.loading}>
            {intl.formatMessage({ id: 'QuizMealStyles.loading' })}
          </div>
        ) : (
          <SpecialDemandForm
            onSubmit={onFormSubmit}
            formRef={formSubmitRef}
            initialValues={initialValues}
            setFormValues={setFormValues}
            nutritionsOptions={nutritionsOptions}
          />
        )}
      </div>
    </QuizModal>
  );
};

export default QuizSpecialDemand;
