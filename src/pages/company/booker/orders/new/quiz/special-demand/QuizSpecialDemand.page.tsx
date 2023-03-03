import { useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';
import { useRouter } from 'next/router';

import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { QuizActions } from '@redux/slices/Quiz.slice';
import { quizPaths } from '@src/paths';

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
  const submitDisabled = useMemo(() => {
    return !formValues?.nutritions?.length;
  }, [formValues?.nutritions]);

  const onFormSubmitClick = () => {
    formSubmitRef?.current.submit();
    router.push(quizPaths.MealStyles);
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

  const initialValues: TSpecialDemandFormValues = useMemo(
    () => ({
      nutritions: quizData.nutritions || [],
    }),
    [quizData.nutritions],
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
        <SpecialDemandForm
          onSubmit={onFormSubmit}
          formRef={formSubmitRef}
          initialValues={initialValues}
          setFormValues={setFormValues}
        />
      </div>
    </QuizModal>
  );
};

export default QuizSpecialDemand;
