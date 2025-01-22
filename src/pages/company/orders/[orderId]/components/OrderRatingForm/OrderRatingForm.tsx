import { Fragment } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';

import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldRating from '@components/FormFields/FieldRating/FieldRating';
import FieldTextArea from '@components/FormFields/FieldTextArea/FieldTextArea';
import MobileBottomContainer from '@components/MobileBottomContainer/MobileBottomContainer';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useAppSelector } from '@hooks/reduxHooks';
import { useViewport } from '@hooks/useViewport';
import { Listing } from '@src/utils/data';
import type { TListing } from '@src/utils/types';

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
  order: TListing;
  images: any;
};
type TOrderRatingFormComponentProps = FormRenderProps<TOrderRatingFormValues> &
  Partial<TExtraProps>;
type TOrderRatingFormProps = FormProps<TOrderRatingFormValues> & TExtraProps;

const OrderRatingFormComponent: React.FC<TOrderRatingFormComponentProps> = (
  props,
) => {
  const { handleSubmit, values, restaurantsByDay, images, inProgress, order } =
    props;
  const submitDisabled = inProgress || !values.general;
  const { isMobileLayout } = useViewport();
  const intl = useIntl();
  const uploadImageInProgress = useAppSelector(
    (state) => state.uploadImage.uploadImageInProgress,
  );

  const pageTitle = isMobileLayout
    ? intl.formatMessage(
        {
          id: 'OrderRatingPage.pageTitle',
        },
        {
          orderTitle: Listing(order!).getAttributes().title,
        },
      )
    : 'Đánh giá tổng quan';
  const btnSumitComponent = (
    <Button
      className={css.submitBtn}
      type="submit"
      inProgress={inProgress}
      disabled={submitDisabled}>
      {intl.formatMessage({
        id: isMobileLayout
          ? 'OrderRatingForm.btnReviewMobile'
          : 'OrderRatingForm.btnReview',
      })}
    </Button>
  );

  const detailRatingContainer: {
    Component: 'ol' | 'div';
    props: {
      className: string;
    };
  } = {
    Component: isMobileLayout ? 'ol' : 'div',
    props: { className: css.detailRatingContainer },
  };

  const pitoRatingContainer = isMobileLayout
    ? {
        Component: Fragment,
        props: {},
      }
    : {
        Component: 'div',
        props: {
          className: css.pitoRating,
        },
      };

  const partnerRatingContainer = isMobileLayout
    ? {
        Component: Fragment,
        props: {},
      }
    : {
        Component: 'div',
        props: {
          className: css.partnerRating,
        },
      };

  const desktopOrderList = isMobileLayout
    ? {
        Component: Fragment,
        props: {},
      }
    : {
        Component: 'ol',
        props: {
          className: css.detailRatingWrapper,
        },
      };

  return (
    <Form onSubmit={handleSubmit}>
      <div className={css.formContainter}>
        <div className={css.generalRatingWrapper}>
          <div className={css.generalRatingTitle}>{pageTitle}</div>
          <FieldRating
            name="general"
            containerClassName={css.generalRatingField}
            optionClassName={css.generalRatingOption}
            iconClassName={css.generalRatingIcon}
            labelClassName={css.generalRatingLabel}
          />
        </div>
        <detailRatingContainer.Component {...detailRatingContainer.props}>
          <pitoRatingContainer.Component {...pitoRatingContainer.props}>
            <RenderWhen condition={!isMobileLayout}>
              <div className={css.ratingSectionTitle}>
                {intl.formatMessage({
                  id: 'OrderRatingForm.reviewPCC',
                })}
              </div>
            </RenderWhen>
            <desktopOrderList.Component {...desktopOrderList.props}>
              <li className={css.detailRatingFieldWrapper}>
                <StaffRating values={values} isShowTitle={!isMobileLayout} />
              </li>
              <li className={css.detailRatingFieldWrapper}>
                <ServiceRating values={values} isShowTitle={!isMobileLayout} />
              </li>
            </desktopOrderList.Component>
          </pitoRatingContainer.Component>
          <partnerRatingContainer.Component {...partnerRatingContainer.props}>
            <RenderWhen condition={!isMobileLayout}>
              <div className={css.ratingSectionTitle}>
                {intl.formatMessage({
                  id: 'OrderRatingForm.reviewRestaurant',
                })}
              </div>
            </RenderWhen>
            <desktopOrderList.Component {...desktopOrderList.props}>
              <li className={css.detailRatingFieldWrapper}>
                <FoodRating
                  values={values}
                  restaurantsByDays={restaurantsByDay}
                  isShowTitle={!isMobileLayout}
                />
              </li>
              <li className={css.detailRatingFieldWrapper}>
                <PackagingRating
                  values={values}
                  restaurantsByDay={restaurantsByDay}
                  isShowTitle={!isMobileLayout}
                />
              </li>
            </desktopOrderList.Component>
          </partnerRatingContainer.Component>
        </detailRatingContainer.Component>
        <div className={css.detailTextRatingWrapper}>
          <FieldTextArea
            id="detailTextRating"
            name="detailTextRating"
            label={intl.formatMessage({
              id: isMobileLayout
                ? 'OrderRatingForm.reviewMoblieDescription'
                : 'OrderRatingForm.reviewDescription',
            })}
            labelClassName={css.detailTextRatingLabel}
            placeholder={intl.formatMessage({
              id: isMobileLayout
                ? 'OrderRatingForm.reviewMoblieDescriptionPlaceHolder'
                : 'OrderRatingForm.reviewDescriptionPlaceHolder',
            })}
            className={css.textareaField}
          />
        </div>
        <div className={css.imagesRatingWrapper}>
          <div className={css.imagesRatingTitle}>
            {intl.formatMessage({
              id: 'OrderRatingForm.image',
            })}
          </div>
          <RatingImagesUploadField
            images={images}
            uploadImageInProgress={uploadImageInProgress}
          />
        </div>
      </div>
      {isMobileLayout ? (
        <MobileBottomContainer className={css.mobileBottonContainer}>
          {btnSumitComponent}
        </MobileBottomContainer>
      ) : (
        <div className={css.submitBtnWrapper}>{btnSumitComponent}</div>
      )}
    </Form>
  );
};

const OrderRatingForm: React.FC<TOrderRatingFormProps> = (props) => {
  return <FinalForm {...props} component={OrderRatingFormComponent} />;
};

export default OrderRatingForm;
