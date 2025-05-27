import { useImperativeHandle } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';
import classNames from 'classnames';

import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldRating from '@components/FormFields/FieldRating/FieldRating';
import FieldTextArea from '@components/FormFields/FieldTextArea/FieldTextArea';
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
  hideFormTitle?: boolean;
};
type TRatingSubOrderFormComponentProps =
  FormRenderProps<TRatingSubOrderFormValues> & Partial<TExtraProps>;
type TRatingSubOrderFormProps = FormProps<TRatingSubOrderFormValues> &
  TExtraProps;

const RatingSubOrderFormComponent: React.FC<
  TRatingSubOrderFormComponentProps
> = (props) => {
  const { handleSubmit, values, inProgress, form, formRef, hideFormTitle } =
    props;
  const intl = useIntl();
  const hasGeneralRating = !!values?.general;
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
    <Form
      className={classNames(css.container, 'w-full')}
      onSubmit={handleSubmit}>
      <div className={css.generalRatingWrapper}>
        {!hideFormTitle && (
          <div
            className={classNames(
              css.generalRatingTitle,
              '!text-lg !font-semibold',
            )}>
            {intl.formatMessage({ id: 'danh-gia-tong-quan' })}
          </div>
        )}
        <FieldRating
          name="general"
          containerClassName={css.generalRatingField}
        />
      </div>

      <div
        className={classNames(
          'transition-all duration-300 ease-in-out overflow-hidden max-h-[2000px]',
          {
            '!max-h-0': !hasGeneralRating,
          },
        )}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-4">
          <div
            className={classNames(
              css.detailRatingWrapper,
              'bg-stone-50 p-4 rounded-lg border border-solid border-stone-300',
            )}>
            <div
              className={classNames(
                css.detailRatingTitle,
                '!text-sm !font-semibold md:!text-base text-center !m-0',
              )}>
              <div>
                {intl.formatMessage({
                  id: 'AddOrderForm.foodIdField.placeholder',
                })}
              </div>
              <div className="min-h-[24px]">
                {values?.food ? (
                  <span className="!font-normal">
                    {`${intl.formatMessage({
                      id: `FieldRating.label.${values?.food}`,
                    })}`}
                  </span>
                ) : (
                  ''
                )}
              </div>
            </div>
            <div className="mx-auto w-[200px]">
              <FieldRating
                name="food"
                containerClassName={classNames(css.detailRatingField, '!gap-2')}
              />
            </div>
          </div>
          <div
            className={classNames(
              css.detailRatingWrapper,
              'bg-stone-50 p-4 rounded-lg border border-solid border-stone-300',
            )}>
            <div
              className={classNames(
                css.detailRatingTitle,
                '!text-sm !font-semibold md:!text-base text-center !mt-0 !mb-0',
              )}>
              <div>
                {intl.formatMessage({
                  id: 'ManagePartnerReviewsPage.packageTitle',
                })}
              </div>
              <div className="min-h-[24px]">
                {values?.packaging ? (
                  <span className="!font-normal">
                    {`${intl.formatMessage({
                      id: `FieldRating.label.${values?.packaging}`,
                    })}`}
                  </span>
                ) : (
                  ''
                )}
              </div>
            </div>

            <div className="mx-auto w-[200px]">
              <FieldRating
                name="packaging"
                containerClassName={css.detailRatingField}
              />
            </div>
          </div>
        </div>

        <div className={css.detailTextRatingWrapper}>
          <FieldTextArea
            id="detailTextRating"
            name="detailTextRating"
            label={intl.formatMessage({ id: 'danh-gia-chi-tiet' })}
            labelClassName={css.detailTextRatingLabel}
            placeholder={intl.formatMessage({
              id: 'hay-giup-chung-toi-hieu-ro-hon-cam-nhan-cua-ban-sau-buoi-an',
            })}
            className={css.textareaField}
          />
        </div>
        <div className={css.imagesRatingWrapper}>
          <div className={css.imagesRatingTitle}>
            {intl.formatMessage({ id: 'OrderRatingForm.image' })}
          </div>
          <RatingImagesUploadField
            images={images}
            containerClassName={css.imagesFieldWrapper}
            uploadImageInProgress={uploadImageInProgress}
          />
        </div>
      </div>

      <div className={css.submitBtnWrapper}>
        <Button
          className={css.submitBtn}
          type="submit"
          inProgress={inProgress}
          disabled={submitDisabled}>
          {intl.formatMessage({ id: 'OrderRatingForm.btnReviewMobile' })}
        </Button>
      </div>
    </Form>
  );
};

const RatingSubOrderForm: React.FC<TRatingSubOrderFormProps> = (props) => {
  return <FinalForm {...props} component={RatingSubOrderFormComponent} />;
};

export default RatingSubOrderForm;
