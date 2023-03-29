import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';

import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldRating from '@components/FormFields/FieldRating/FieldRating';
import FieldTextArea from '@components/FormFields/FieldTextArea/FieldTextArea';

import RatingImagesUploadField from '../RatingImagesUploadField/RatingImagesUploadField';

import FoodRating from './FoodRating';
import PackagingRating from './PackagingRating';
import ServiceRating from './ServiceRating';
import StaffRating from './StaffRating';

import css from './OrderRatingForm.module.scss';

export type TOrderRatingFormValues = {
  general: number;
  staff?: number;
  food?: number;
  packaging?: number;
  service?: number;
  [key: string]: any;
};

type TExtraProps = {
  restaurantsByDay: any;
  inProgress: boolean;
  images: any;
};
type TOrderRatingFormComponentProps = FormRenderProps<TOrderRatingFormValues> &
  Partial<TExtraProps>;
type TOrderRatingFormProps = FormProps<TOrderRatingFormValues> & TExtraProps;

const OrderRatingFormComponent: React.FC<TOrderRatingFormComponentProps> = (
  props,
) => {
  const { handleSubmit, values, restaurantsByDay, images, inProgress } = props;
  const submitDisabled = inProgress || !values.general;

  return (
    <Form onSubmit={handleSubmit}>
      <div className={css.generalRatingWrapper}>
        <div className={css.generalRatingTitle}>Đánh giá tổng quan</div>
        <FieldRating
          name="general"
          containerClassName={css.generalRatingField}
        />
      </div>
      <div className={css.detailRatingContainer}>
        <div className={css.pitoRating}>
          <div className={css.ratingSectionTitle}>
            Đánh giá về PITO Cloud Canteen
          </div>
          <ol className={css.detailRatingWrapper}>
            <li className={css.detailRatingFieldWrapper}>
              <StaffRating values={values} />
            </li>
            <li className={css.detailRatingFieldWrapper}>
              <ServiceRating values={values} />
            </li>
          </ol>
        </div>
        <div className={css.partnerRating}>
          <div className={css.ratingSectionTitle}>Đánh giá về nhà hàng</div>
          <ol className={css.detailRatingWrapper}>
            <li className={css.detailRatingFieldWrapper}>
              <FoodRating values={values} restaurantsByDay={restaurantsByDay} />
            </li>
            <li className={css.detailRatingFieldWrapper}>
              <PackagingRating
                values={values}
                restaurantsByDay={restaurantsByDay}
              />
            </li>
          </ol>
        </div>
      </div>
      <div className={css.detailTextRatingWrapper}>
        <FieldTextArea
          id="detailTextRating"
          name="detailTextRating"
          label="Hãy chia sẻ chi tiết hơn về trải nghiệm tuần ăn của bạn"
          labelClassName={css.detailTextRatingLabel}
          placeholder="Chia sẻ trải nghiệm của bạn ở đây"
          className={css.textareaField}
        />
      </div>
      <div className={css.imagesRatingWrapper}>
        <div className={css.imagesRatingTitle}>Hình ảnh</div>
        <RatingImagesUploadField images={images} />
      </div>
      <div className={css.submitBtnWrapper}>
        <Button
          className={css.submitBtn}
          type="submit"
          inProgress={inProgress}
          disabled={submitDisabled}>
          Đánh giá
        </Button>
      </div>
    </Form>
  );
};

const OrderRatingForm: React.FC<TOrderRatingFormProps> = (props) => {
  return <FinalForm {...props} component={OrderRatingFormComponent} />;
};

export default OrderRatingForm;
