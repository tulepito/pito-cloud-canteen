import { useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';
import classNames from 'classnames';
import { isEmpty, keyBy, mapValues } from 'lodash';

import Button from '@components/Button/Button';
import FieldMultiplePhotosMobile from '@components/FormFields/FieldMultiplePhotosMobile/FieldMultiplePhotosMobile';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import HighlightBox from '@components/HighlightBox/HighlightBox';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { addImages } from '@redux/slices/uploadImage.slice';
import { Listing } from '@src/utils/data';
import { EImageVariants } from '@src/utils/enums';
import {
  composeValidators,
  maxLength,
  minPriceLength,
  numberMinLength,
  parsePrice,
  required,
  upperCaseFirstLetter,
  validFoodTitle,
} from '@src/utils/validators';

import css from './FoodBasicInfoTab.module.scss';

type TFoodBasicInforTabFormPartProps = {
  invalid?: boolean;
  inProgress?: boolean;
};

const FoodBasicInforTabFormPart: React.FC<TFoodBasicInforTabFormPartProps> = (
  props,
) => {
  const { invalid, inProgress } = props;
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const currentFoodListing = useAppSelector(
    (state) => state.PartnerFood.currentFoodListing,
    shallowEqual,
  );
  const currentFoodListingGetter = Listing(currentFoodListing);
  const currentFoodListingImages = currentFoodListingGetter.getImages();
  const currentFoodListingImagesObject = keyBy(
    currentFoodListingImages,
    'id.uuid',
  );
  const formattedCurrentFoodListingImages = mapValues(
    currentFoodListingImagesObject,
    (image) => ({
      imageId: image.id,
      uploadedImage: image,
    }),
  );
  const uploadedImages = useAppSelector(
    (state) => state.uploadImage.images,
    shallowEqual,
  );

  const submitDisabled = invalid;

  useEffect(() => {
    dispatch(addImages(formattedCurrentFoodListingImages));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, JSON.stringify(formattedCurrentFoodListingImages)]);

  return (
    <div className={css.root}>
      <div className={css.formTitle}>Thông tin cơ bản</div>
      <FieldTextInput
        name="title"
        className={css.field}
        id="title"
        placeholder={intl.formatMessage({
          id: 'EditPartnerFoodForm.foodTitlePlaceholder',
        })}
        label={intl.formatMessage({
          id: 'EditPartnerFoodForm.foodTitleLabel',
        })}
        required
        parse={upperCaseFirstLetter}
        validate={composeValidators(
          required(
            intl.formatMessage({ id: 'EditPartnerFoodForm.titleRequired' }),
          ),
          maxLength(
            intl.formatMessage({
              id: 'EditPartnerFoodForm.titleMaxLength',
            }),
            150,
          ),
          validFoodTitle(
            intl.formatMessage({
              id: 'EditPartnerFoodForm.titleInValid',
            }),
          ),
        )}
      />
      <FieldMultiplePhotosMobile
        images={uploadedImages}
        labelClassName={css.field}
        name="images"
        label={intl.formatMessage({
          id: 'EditPartnerFoodForm.foodImagesLabel',
        })}
        variants={[EImageVariants.squareSmall2x]}
        hintShowed={isEmpty(uploadedImages)}
      />
      <FieldTextInput
        className={css.field}
        type="number"
        inputClassName={css.inputWithSuffix}
        label="Thời gian đặt tối thiểu trước"
        required
        name="minOrderHourInAdvance"
        id="minOrderHourInAdvance"
        placeholder={intl.formatMessage({
          id: 'EditPartnerFoodForm.orderHourInAdvancePlaceholder',
        })}
        rightIcon={<div>h</div>}
        rightIconContainerClassName={css.inputSuffixed}
        validate={composeValidators(
          required(
            intl.formatMessage({
              id: 'EditPartnerFoodForm.minOrderHourInAdvanceRequired',
            }),
          ),
          numberMinLength(
            intl.formatMessage({
              id: 'EditPartnerFoodForm.minOrderHourInAdvanceInvalid',
            }),
            1,
          ),
        )}
      />
      <FieldTextInput
        className={css.field}
        type="number"
        inputClassName={css.inputWithSuffix}
        label="Số lượng đặt tối thiểu"
        required
        name="minOrderNumberInAdvance"
        id="minOrderNumberInAdvance"
        placeholder={intl.formatMessage({
          id: 'EditPartnerFoodForm.minOrderNumberInAdvancePlaceholder',
        })}
        rightIcon={<div>h</div>}
        rightIconContainerClassName={css.inputSuffixed}
        validate={composeValidators(
          required(
            intl.formatMessage({
              id: 'EditPartnerFoodForm.minOrderNumberInAdvanceRequired',
            }),
          ),
          numberMinLength(
            intl.formatMessage({
              id: 'EditPartnerFoodForm.minOrderNumberInAdvanceInvalid',
            }),
            1,
          ),
        )}
      />
      <FieldTextInput
        className={classNames(css.field, css.priceField)}
        name="price"
        id="price"
        label={intl.formatMessage({ id: 'EditPartnerFoodForm.priceLabel' })}
        required
        placeholder={intl.formatMessage({
          id: 'EditPartnerFoodForm.pricePlaceholder',
        })}
        inputClassName={css.inputWithSuffix}
        rightIcon={<div className={css.inputSuffixed}>đ</div>}
        rightIconContainerClassName={css.inputSuffixed}
        validate={composeValidators(
          required(
            intl.formatMessage({ id: 'EditPartnerFoodForm.priceRequired' }),
          ),
          minPriceLength(
            intl.formatMessage({
              id: 'EditPartnerFoodForm.priceMinLength',
            }),
            1000,
          ),
        )}
        parse={parsePrice}
      />
      <HighlightBox>
        <FormattedMessage id="FoodBasicInforTabFormPart.hint" />
      </HighlightBox>
      <FieldTextInput
        name="unit"
        className={css.field}
        id="unit"
        placeholder="Phần/Tô/Hộp"
        label="Đơn vị tính"
        parse={upperCaseFirstLetter}
      />

      <div className={css.fixedBottomBtn}>
        <Button
          type="submit"
          className={css.nextButton}
          disabled={submitDisabled}
          inProgress={inProgress}>
          Tiếp theo
        </Button>
      </div>
    </div>
  );
};

export default FoodBasicInforTabFormPart;
