import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';
import arrayMutators from 'final-form-arrays';

import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldCheckboxGroup from '@components/FormFields/FieldCheckboxGroup/FieldCheckboxGroup';
import type { TTotalRating } from '@src/types/partnerReviews';

import css from './PartnerReviewsFilterForm.module.scss';

export type TPartnerReviewsFilterFormValues = {
  ratings: number[];
};

type TExtraProps = {
  onClearFilter: () => void;
  ratingDetail: TTotalRating[];
};
type TPartnerReviewsFilterFormComponentProps =
  FormRenderProps<TPartnerReviewsFilterFormValues> & Partial<TExtraProps>;

type TFilterPartnerReviewFilterFormProps =
  FormProps<TPartnerReviewsFilterFormValues> & TExtraProps;

const PartnerReviewsFilterFormComponent: React.FC<
  TPartnerReviewsFilterFormComponentProps
> = ({ ratingDetail = [], handleSubmit, onClearFilter, pristine }) => {
  const intl = useIntl();

  const generateScoresOptions = () => {
    return ratingDetail.map((detail) => {
      const label = `${intl.formatMessage({
        id: `FieldRating.label.${detail.rating}`,
      })} (${detail.total})`;

      return {
        key: detail.rating,
        label,
      };
    });
  };
  const submitDisabled = pristine;

  return (
    <Form onSubmit={handleSubmit} className={css.scoreCheckboxContainer}>
      <div className={css.fieldCheckboxContainer}>
        <FieldCheckboxGroup
          itemClassName={css.checkboxGroup}
          id="ratings"
          options={generateScoresOptions()}
          name="ratings"
        />
      </div>
      <div className={css.buttonContainer} onClick={onClearFilter}>
        <Button className={css.btnItem} variant="secondary" type="button">
          {intl.formatMessage({
            id: 'IntegrationFilterModal.clearBtn',
          })}
        </Button>
        <Button className={css.btnItem} disabled={submitDisabled}>
          {intl.formatMessage({
            id: 'FilterPartnerOrderForm.submitButtonText',
          })}
        </Button>
      </div>
    </Form>
  );
};

const PartnerReviewsFilterForm: React.FC<
  TFilterPartnerReviewFilterFormProps
> = (props) => {
  return (
    <FinalForm
      mutators={{ ...arrayMutators }}
      {...props}
      component={PartnerReviewsFilterFormComponent}
    />
  );
};

export default PartnerReviewsFilterForm;
