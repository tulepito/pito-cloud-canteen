import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import isEqual from 'lodash/isEqual';

import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldCheckbox from '@components/FormFields/FieldCheckbox/FieldCheckbox';
import { ALLERGIES_OPTIONS } from '@src/utils/enums';

import css from './SpecialDemandForm.module.scss';

export type TSpecialDemandFormValues = {
  allergies: string[];
  nutritions: string[];
};

type TExtraProps = {
  nutritionOptions?: { key: string; label: string }[];
  inProgress: boolean;
  view: string;
};
type TSpecialDemandFormComponentProps =
  FormRenderProps<TSpecialDemandFormValues> & Partial<TExtraProps>;
type TSpecialDemandFormProps = FormProps<TSpecialDemandFormValues> &
  TExtraProps;

const SpecialDemandFormComponent: React.FC<TSpecialDemandFormComponentProps> = (
  props,
) => {
  const {
    handleSubmit,
    nutritionOptions = [],
    initialValues,
    values,
    invalid,
    submitting,
    inProgress,
    view,
  } = props;
  const isFormNotChanged = isEqual(initialValues, values);
  const disabledSubmit =
    isFormNotChanged || submitting || invalid || inProgress;

  return (
    <Form onSubmit={handleSubmit} className={css.root}>
      <div className={css.header}>Yêu cầu đặc biệt</div>
      <div className={css.formContainer}>
        <div className={css.fieldsContainer}>
          <div className={css.fieldWrapper}>
            <div className={css.title}>Dị ứng</div>
            <div className={css.fieldGroup}>
              {ALLERGIES_OPTIONS.map(({ key, label }) => (
                <FieldCheckbox
                  key={key}
                  id={`${view}-allergies-${key}`}
                  name="allergies"
                  value={key}
                  label={label}
                  className={css.field}
                />
              ))}
            </div>
          </div>
          <div className={css.fieldWrapper}>
            <div className={css.title}>Chế độ dinh dưỡng</div>
            <div className={css.fieldGroup}>
              {nutritionOptions.map(({ key, label }) => (
                <FieldCheckbox
                  key={key}
                  id={`${view}-nutritions-${key}`}
                  name="nutritions"
                  value={key}
                  label={label}
                  className={css.field}
                />
              ))}
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={disabledSubmit}
          inProgress={inProgress}
          className={css.submitBtn}>
          Lưu thay đổi
        </Button>
      </div>
    </Form>
  );
};

const SpecialDemandForm: React.FC<TSpecialDemandFormProps> = (props) => {
  return <FinalForm {...props} component={SpecialDemandFormComponent} />;
};

export default SpecialDemandForm;
