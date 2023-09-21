import { useImperativeHandle } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';

import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldRating from '@components/FormFields/FieldRating/FieldRating';
import FieldTextArea from '@components/FormFields/FieldTextArea/FieldTextArea';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useAppSelector } from '@hooks/reduxHooks';
import RatingImagesUploadField from '@pages/company/orders/[orderId]/components/RatingImagesUploadField/RatingImagesUploadField';

import css from './RatingSubOrderForm.module.scss';

export type TRatingSubOrderFormValues = {
  general: string;
  food: string;
  packaging: string;
  detailTextRating: string;
  images: any;
};

type TExtraProps = {
  images?: any;
  inProgress?: boolean;
  formRef?: any;
};
type TRatingSubOrderFormComponentProps =
  FormRenderProps<TRatingSubOrderFormValues> & Partial<TExtraProps>;
type TRatingSubOrderFormProps = FormProps<TRatingSubOrderFormValues> &
  TExtraProps;

const RatingSubOrderFormComponent: React.FC<
  TRatingSubOrderFormComponentProps
> = (props) => {
  const { handleSubmit, values, inProgress, form, formRef } = props;
  const intl = useIntl();
  const hasGeneralRating = !!values?.general;
  const hadFoodRating = !!values?.food;
  const hadPackagingRating = !!values?.packaging;
  useImperativeHandle(formRef, () => form);
  const images = useAppSelector(
    (state) => state.uploadImage.images,
    shallowEqual,
  );
  const uploadImageInProgress = useAppSelector(
    (state) => state.uploadImage.uploadImageInProgress,
  );
  const postRatingInProgress = useAppSelector(
    (state) => state.ParticipantOrderList.participantPostRatingInProgress,
  );

  const hasErrorImages = Object.values(images).some((i: any) => i.uploadError);

  const submitDisabled =
    postRatingInProgress ||
    !hasGeneralRating ||
    hasErrorImages ||
    uploadImageInProgress;

  return (
    <Form className={css.container} onSubmit={handleSubmit}>
      <div className={css.generalRatingWrapper}>
        <div className={css.generalRatingTitle}>Đánh giá tổng quan</div>
        <FieldRating
          name="general"
          containerClassName={css.generalRatingField}
        />
      </div>
      <RenderWhen condition={hasGeneralRating}>
        <>
          <div className={css.detailRatingWrapper}>
            <div className={css.detailRatingTitle}>1. Món ăn</div>
            <FieldRating
              name="food"
              containerClassName={css.detailRatingField}
            />
            <RenderWhen condition={hadFoodRating}>
              <div className={css.ratingValue}>
                {intl.formatMessage({
                  id: `FieldRating.label.${values?.food}`,
                })}
              </div>
            </RenderWhen>
          </div>
          <div className={css.detailRatingWrapper}>
            <div className={css.detailRatingTitle}>2. Dụng cụ</div>
            <FieldRating
              name="packaging"
              containerClassName={css.detailRatingField}
            />
            <RenderWhen condition={hadPackagingRating}>
              <div className={css.ratingValue}>
                {intl.formatMessage({
                  id: `FieldRating.label.${values?.packaging}`,
                })}
              </div>
            </RenderWhen>
          </div>
          <div className={css.detailTextRatingWrapper}>
            <FieldTextArea
              id="detailTextRating"
              name="detailTextRating"
              label="Đánh giá chi tiết"
              labelClassName={css.detailTextRatingLabel}
              placeholder="Hãy giúp chúng tôi hiểu rõ hơn cảm nhận của bạn sau buổi ăn"
              className={css.textareaField}
            />
          </div>
          <div className={css.imagesRatingWrapper}>
            <div className={css.imagesRatingTitle}>Hình ảnh</div>
            <RatingImagesUploadField
              images={images}
              containerClassName={css.imagesFieldWrapper}
              uploadImageInProgress={uploadImageInProgress}
            />
          </div>
        </>
      </RenderWhen>

      <div className={css.submitBtnWrapper}>
        <Button
          className={css.submitBtn}
          type="submit"
          inProgress={inProgress}
          disabled={submitDisabled}>
          Gửi đánh giá
        </Button>
      </div>
    </Form>
  );
};

const RatingSubOrderForm: React.FC<TRatingSubOrderFormProps> = (props) => {
  return <FinalForm {...props} component={RatingSubOrderFormComponent} />;
};

export default RatingSubOrderForm;
