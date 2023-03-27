/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';
import { useRouter } from 'next/router';

import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { QuizActions, QuizThunks } from '@redux/slices/Quiz.slice';
import { quizPaths } from '@src/paths';
import { User } from '@src/utils/data';

import useRedirectAfterReloadPage from '../../hooks/useRedirectAfterReloadPage';
import QuizModal from '../components/QuizModal/QuizModal';

import type { TSpecialDemandFormValues } from './SpecialDemandForm/SpecialDemandForm';
import SpecialDemandForm from './SpecialDemandForm/SpecialDemandForm';

import css from './QuizSpecialDemand.module.scss';

const QuizSpecialDemand = () => {
  const intl = useIntl();
  const router = useRouter();
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
    (state) => state.Quiz.nutritions,
    shallowEqual,
  );
  const fetchSearchFilter = useAppSelector(
    (state) => state.Quiz.fetchFilterInProgress,
  );
  const submitDisabled = useMemo(() => {
    return !formValues?.nutritions?.length;
  }, [formValues?.nutritions]);

  const { nutritions } = User(selectedCompany).getPublicData();
  const onFormSubmitClick = () => {
    formSubmitRef?.current.submit();
    router.push({
      pathname: quizPaths.MealStyles,
      query: { ...router.query },
    });
  };
  const onFormSubmit = (values: TSpecialDemandFormValues) => {
    dispatch(QuizActions.updateQuiz({ ...values }));
  };

  const onCancel = () => {
    router.push(quizPaths.MealStyles);
  };

  const goBack = () => {
    router.back();
  };

  useEffect(() => {
    if (nutritionsOptions.length === 0)
      dispatch(QuizThunks.fetchSearchFilter());
  }, [dispatch]);
  const initialValues: TSpecialDemandFormValues = useMemo(
    () => ({
      nutritions: quizData.nutritions || nutritions || [],
    }),
    [JSON.stringify(quizData.nutritions), JSON.stringify(nutritions)],
  );

  return (
    <QuizModal
      id="QuizSpecialDemand"
      isOpen
      handleClose={() => {}}
      modalTitle={intl.formatMessage({
        id: 'QuizSpecialDemand.title',
      })}
      submitText="Tiếp tục"
      cancelText="Bỏ qua"
      onCancel={onCancel}
      onSubmit={onFormSubmitClick}
      submitDisabled={submitDisabled}
      onBack={goBack}>
      <div className={css.formContainer}>
        {fetchSearchFilter ? (
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
