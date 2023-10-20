import { useIntl } from 'react-intl';

import Button from '@components/Button/Button';
import FieldTextArea from '@components/FormFields/FieldTextArea/FieldTextArea';
import { composeValidators, maxLength, required } from '@src/utils/validators';

import css from './FoodAdditionalInfoTab.module.scss';

type TFoodAdditionalInfoTabFormPartProps = {
  invalid?: boolean;
  inProgress?: boolean;
};

const FoodAdditionalInfoTabFormPart: React.FC<
  TFoodAdditionalInfoTabFormPartProps
> = (props) => {
  const { invalid, inProgress } = props;
  const intl = useIntl();

  return (
    <div className={css.root}>
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
    </div>
  );
};

export default FoodAdditionalInfoTabFormPart;
