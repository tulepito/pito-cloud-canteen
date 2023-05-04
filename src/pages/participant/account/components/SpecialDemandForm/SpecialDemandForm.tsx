import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';

import Button from '@components/Button/Button';
import FixedBottomButtons from '@components/FixedBottomButtons/FixedBottomButtons';
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
    invalid,
    submitting,
    inProgress,
  } = props;
  const disabledSubmit = submitting || invalid || inProgress;

  return (
    <Form onSubmit={handleSubmit} className={css.formContainer}>
      <div className={css.fieldWrapper}>
        <div className={css.title}>Dị ứng</div>
        <div className={css.fieldGroup}>
          {ALLERGIES_OPTIONS.map(({ key, label }) => (
            <FieldCheckbox
              key={key}
              id={`allergies-${key}`}
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
              id={`nutritions-${key}`}
              name="nutritions"
              value={key}
              label={label}
              className={css.field}
            />
          ))}
        </div>
      </div>
      <FixedBottomButtons
        isAbsolute
        FirstButton={
          <Button
            type="submit"
            disabled={disabledSubmit}
            inProgress={inProgress}
            className={css.submitBtn}>
            Lưu thay đổi
          </Button>
        }
      />
    </Form>
  );
};

const SpecialDemandForm: React.FC<TSpecialDemandFormProps> = (props) => {
  return <FinalForm {...props} component={SpecialDemandFormComponent} />;
};

export default SpecialDemandForm;
