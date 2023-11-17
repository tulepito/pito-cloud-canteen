import { useField, useForm } from 'react-final-form-hooks';
import { shallowEqual } from 'react-redux';
import classNames from 'classnames';

import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { QuizActions } from '@redux/slices/Quiz.slice';
import type { TKeyValue } from '@src/utils/types';

import type { TSpecialDemandFormValues } from '../special-demand/SpecialDemandForm/SpecialDemandForm';

import css from './QuizMealStyles.module.scss';

export type TMealStylesFormValues = {
  mealStyles: string[];
};

type TMealStylesFormProps = {
  initialValues: Partial<TMealStylesFormValues>;
  formValues: Partial<TSpecialDemandFormValues & TMealStylesFormValues>;
  setFormValues: (
    values: Partial<TSpecialDemandFormValues & TMealStylesFormValues>,
  ) => void;
};

const MealStylesForm: React.FC<TMealStylesFormProps> = ({
  initialValues,
  formValues,
  setFormValues,
}) => {
  const dispatch = useAppDispatch();
  const mealStyles = useAppSelector(
    (state) => state.SystemAttributes.categories,
    shallowEqual,
  );

  const { form } = useForm<TMealStylesFormValues>({
    onSubmit: (values) => {
      dispatch(QuizActions.updateQuiz({ ...values }));
    },
    initialValues,
  });
  const mealStylesInput = useField('mealStyles', form);
  const selectedMealStyles = mealStylesInput.input.value;

  const handleSelect = (mealStyle: string) => () => {
    let needSortMealStyles = [];
    if (selectedMealStyles.includes(mealStyle)) {
      needSortMealStyles = selectedMealStyles.filter(
        (item: string) => item !== mealStyle,
      );
    } else {
      needSortMealStyles = selectedMealStyles.concat(mealStyle);
    }

    const sortMealStyles = needSortMealStyles.sort();

    form.change('mealStyles', sortMealStyles);
    setFormValues({ ...formValues, mealStyles: sortMealStyles });
  };

  return (
    <div className={css.root}>
      <div className={css.formTitle}>Chọn 5 gu ẩm thực bạn yêu thích</div>

      <div className={css.formContainer}>
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
              onClick={handleSelect(mealStyle.key)}>
              {mealStyle.label}
            </div>
          ))}
        </form>
      </div>
    </div>
  );
};

export default MealStylesForm;
