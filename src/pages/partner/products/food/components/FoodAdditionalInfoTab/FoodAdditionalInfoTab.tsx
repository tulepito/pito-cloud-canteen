import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';

import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldTextArea from '@components/FormFields/FieldTextArea/FieldTextArea';
import { composeValidators, maxLength, required } from '@src/utils/validators';

import css from './FoodAdditionalInfoTab.module.scss';

export type TFoodAdditionalInfoTabValues = {};

type TExtraProps = {
  inProgress?: boolean;
};
type TFoodAdditionalInfoTabComponentProps =
  FormRenderProps<TFoodAdditionalInfoTabValues> & Partial<TExtraProps>;
type TFoodAdditionalInfoTabProps = FormProps<TFoodAdditionalInfoTabValues> &
  TExtraProps;

const FoodAdditionalInfoTabComponent: React.FC<
  TFoodAdditionalInfoTabComponentProps
> = (props) => {
  const { handleSubmit, invalid, inProgress } = props;
  const intl = useIntl();

  return (
    <Form onSubmit={handleSubmit} className={css.root}>
      <div className={css.formTitle}>Thông tin thêm</div>
      <FieldTextArea
        className={css.field}
        name="description"
        id="description"
        placeholder={intl.formatMessage({
          id: 'EditPartnerFoodForm.descriptionPlaceholder',
        })}
        label={intl.formatMessage({
          id: 'EditPartnerFoodForm.descriptionLabel',
        })}
        required
        validate={composeValidators(
          maxLength(
            intl.formatMessage({
              id: 'EditPartnerFoodForm.descriptionMaxLength',
            }),
            200,
          ),
          required(
            'Vui lòng nhập mô tả món ăn. Mô tả món ăn không được để trống.',
          ),
        )}
      />
      <div className={css.fixedBottomBtn}>
        <Button
          type="submit"
          className={css.nextButton}
          disabled={invalid}
          inProgress={inProgress}>
          Hoàn tất
        </Button>
        <Button type="button" variant="secondary" className={css.nextButton}>
          Trở về
        </Button>
      </div>
    </Form>
  );
};

const FoodAdditionalInfoTab: React.FC<TFoodAdditionalInfoTabProps> = (
  props,
) => {
  return <FinalForm {...props} component={FoodAdditionalInfoTabComponent} />;
};

export default FoodAdditionalInfoTab;
