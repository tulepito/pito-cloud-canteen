import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { QuizThunks } from '@redux/slices/Quiz.slice';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { useField, useForm } from 'react-final-form-hooks';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';

import QuizModal from '../components/QuizModal/QuizModal';
import css from './QuizMealStyles.module.scss';

type QuizMealStylesFormValues = {
  mealStyles: string[];
};
const QuizMealStyles = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const mealStyles = useAppSelector(
    (state) => state.Quiz.categories,
    shallowEqual,
  );
  const fetchMealStyles = useAppSelector(
    (state) => state.Quiz.fetchFilterInProgress,
  );
  const [selectedMealStyles, setSelectedMealStyles] = useState<string[]>([]);
  useEffect(() => {
    dispatch(QuizThunks.fetchSearchFilter());
  }, [dispatch]);

  const { handleSubmit, form } = useForm<QuizMealStylesFormValues>({
    onSubmit: (values) => {
      console.log('values :>> ', values);
    },
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
  const onSubmitFormClick = () => {
    handleSubmit();
  };

  useEffect(() => {
    form.change('mealStyles', selectedMealStyles);
  }, [form, selectedMealStyles, selectedMealStyles.length]);
  return (
    <QuizModal
      isOpen
      handleClose={() => {}}
      modalTitle={intl.formatMessage({ id: 'QuizMealStyles.title' })}
      submitText="Tiếp tục"
      cancelText="Bỏ qua"
      onCancel={() => {}}
      onSubmit={onSubmitFormClick}
      submitDisabled={false}
      onBack={() => {}}>
      <div className={css.formContainer}>
        {fetchMealStyles ? (
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
            {mealStyles.map((mealStyle) => (
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
