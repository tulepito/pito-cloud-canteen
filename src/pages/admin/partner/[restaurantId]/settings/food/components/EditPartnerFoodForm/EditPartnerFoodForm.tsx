import Button from '@components/Button/Button';
import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import Form from '@components/Form/Form';
import FieldCheckboxGroup from '@components/FormFields/FieldCheckboxGroup/FieldCheckboxGroup';
import FieldMutiplePhotos from '@components/FormFields/FieldMultiplePhotos/FieldMultiplePhotos';
import FieldMultipleSelect from '@components/FormFields/FieldMultipleSelect/FieldMultipleSelect';
import FieldRadioButton from '@components/FormFields/FieldRadioButton/FieldRadioButton';
import FieldSelect from '@components/FormFields/FieldSelect/FieldSelect';
import FieldTextArea from '@components/FormFields/FieldTextArea/FieldTextArea';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { foodSliceAction, foodSliceThunks } from '@redux/slices/foods.slice';
import {
  CATEGORY_OPTIONS,
  EImageVariants,
  FOOD_TYPE_OPTIONS,
  MENU_OPTIONS,
  OTHER_OPTION,
  SIDE_DISH_OPTIONS,
  SPECIAL_DIET_OPTIONS,
} from '@utils/enums';
import { pickRenderableImages } from '@utils/images';
import {
  composeValidators,
  minPriceLength,
  nonEmptyImageArray,
  numberMinLength,
  parsePrice,
  required,
} from '@utils/validators';
import classNames from 'classnames';
import arrayMutators from 'final-form-arrays';
import isEqual from 'lodash/isEqual';
import { useState } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';

import type { TEditPartnerFoodFormValues } from '../../utils';
import css from './EditPartnerFoodForm.module.scss';

type TExtraProps = {
  submittedValues?: TEditPartnerFoodFormValues;
  inProgress: boolean;
  formError?: any;
  isEditting?: boolean;
};
type TEditPartnerFoodFormComponentProps =
  FormRenderProps<TEditPartnerFoodFormValues> & Partial<TExtraProps>;
type TEditPartnerFoodFormProps = FormProps<TEditPartnerFoodFormValues> &
  TExtraProps;

const EditPartnerFoodFormComponent: React.FC<
  TEditPartnerFoodFormComponentProps
> = (props) => {
  const { values, submittedValues, inProgress, formError, isEditting } = props;
  const dispatch = useAppDispatch();
  const ready = isEqual(submittedValues, values);
  const {
    uploadedImages,
    uploadedImagesOrder,
    removedImageIds,
    uploadImageError,
    currentFoodListing = {},
  } = useAppSelector((state) => state.foods, shallowEqual);

  const images = pickRenderableImages(
    currentFoodListing,
    uploadedImages,
    uploadedImagesOrder,
    removedImageIds,
  );

  const onImageUpload = (params: { id: string; file: File }) => {
    return dispatch(
      foodSliceThunks.requestUploadFoodImages(params),
    ) as Promise<{ payload: any }>;
  };

  const onRemoveImage = (id: string) => {
    return dispatch(foodSliceAction.removeImage(id));
  };
  const { handleSubmit } = props;

  const intl = useIntl();

  return (
    <Form onSubmit={handleSubmit} className={css.root}>
      <div className={css.fieldPhotos}>
        <FieldMutiplePhotos
          name="images"
          id="images"
          onImageUpload={onImageUpload}
          onRemoveImage={onRemoveImage}
          images={images}
          variants={[EImageVariants.squareSmall2x]}
          className={css.imageInputWrapper}
          inputClassName={css.imageInput}
          uploadImageError={uploadImageError}
          validate={nonEmptyImageArray(
            intl.formatMessage({ id: 'EditPartnerFoodForm.imageRequired' }),
          )}
        />
      </div>
      <div className={css.radioFields}>
        <label className={css.label}>
          {intl.formatMessage({ id: 'EditPartnerFoodForm.menuLabel' })}
        </label>
        {MENU_OPTIONS.map((option) => (
          <FieldRadioButton
            key={option.key}
            name="menuType"
            id={option.key}
            value={option.key}
            label={option.label}
          />
        ))}
      </div>
      <div className={css.flexField}>
        <div className={css.field}>
          <label className={css.label}>
            {intl.formatMessage({
              id: 'EditPartnerFoodForm.minQuantityPerOrderLabel',
            })}
          </label>
          <div className={css.minOrderFields}>
            <FieldTextInput
              className={css.minOrderField}
              type="number"
              name="minOrderHourInAdvance"
              id="minOrderHourInAdvance"
              placeholder={intl.formatMessage({
                id: 'EditPartnerFoodForm.orderHourInAdvancePlaceholder',
              })}
              rightIcon={<div className={css.inputSuffixed}>h</div>}
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
              className={css.minOrderField}
              name="minQuantity"
              type="number"
              id="minQuantity"
              placeholder={intl.formatMessage({
                id: 'EditPartnerFoodForm.minQuantityPerOrderPlaceholder',
              })}
              rightIcon={<div className={css.inputSuffixed}>phần</div>}
              rightIconContainerClassName={css.inputSuffixedContainer}
              validate={composeValidators(
                required(
                  intl.formatMessage({
                    id: 'EditPartnerFoodForm.minQuantityRequired',
                  }),
                ),
                numberMinLength(
                  intl.formatMessage({
                    id: 'EditPartnerFoodForm.minQuantityInvalid',
                  }),
                  1,
                ),
              )}
            />
          </div>
        </div>
        <FieldTextInput
          className={css.field}
          name="maxMember"
          type="number"
          id="maxMember"
          placeholder={intl.formatMessage({
            id: 'EditPartnerFoodForm.maxMemberPlaceholder',
          })}
          label={intl.formatMessage({
            id: 'EditPartnerFoodForm.maxMemberLabel',
          })}
          rightIcon={<div className={css.inputSuffixed}>người</div>}
          rightIconContainerClassName={css.inputSuffixedContainer}
          validate={composeValidators(
            required(
              intl.formatMessage({
                id: 'EditPartnerFoodForm.maxMemberRequired',
              }),
            ),
            numberMinLength(
              intl.formatMessage({
                id: 'EditPartnerFoodForm.maxMemberInvalid',
              }),
              1,
            ),
          )}
        />
      </div>
      <div className={css.flexField}>
        <div className={classNames(css.field, css.titleFields)}>
          <FieldTextInput
            name="title"
            className={css.titleField}
            id="title"
            placeholder={intl.formatMessage({
              id: 'EditPartnerFoodForm.foodTitlePlaceholder',
            })}
            label={intl.formatMessage({
              id: 'EditPartnerFoodForm.foodTitleLabel',
            })}
            validate={required(
              intl.formatMessage({ id: 'EditPartnerFoodForm.titleRequired' }),
            )}
          />
          <FieldTextInput
            className={css.unitField}
            name="unit"
            id="unit"
            placeholder={intl.formatMessage({
              id: 'EditPartnerFoodForm.unitPlaceholder',
            })}
            label={intl.formatMessage({
              id: 'EditPartnerFoodForm.unitLabel',
            })}
            validate={composeValidators(
              required(
                intl.formatMessage({ id: 'EditPartnerFoodForm.unitRequired' }),
              ),
            )}
          />
        </div>
        <FieldSelect
          className={css.field}
          name="category"
          id="category"
          placeholder={intl.formatMessage({
            id: 'EditPartnerFoodForm.foodCategoryPlaceholder',
          })}
          label={intl.formatMessage({
            id: 'EditPartnerFoodForm.foodCategoryLabel',
          })}
          validate={required(
            intl.formatMessage({ id: 'EditPartnerFoodForm.categoryRequired' }),
          )}>
          {CATEGORY_OPTIONS.filter((cate) => cate.key !== OTHER_OPTION).map(
            (cat) => (
              <option key={cat.key} value={cat.key}>
                {cat.label}
              </option>
            ),
          )}
        </FieldSelect>
      </div>
      <div className={css.flexField}>
        <FieldCheckboxGroup
          className={css.field}
          options={SPECIAL_DIET_OPTIONS}
          name="specialDiets"
          id="specialDiets"
          label={intl.formatMessage({
            id: 'EditPartnerFoodForm.specialDietsLabel',
          })}
          listClassName={css.specialDietsList}
          checkboxClassName={css.specialDietsCheckbox}
          labelClassName={css.specialDietsLabel}
          itemClassName={css.specialDietsItem}
        />
        <div className={css.field}>
          <label className={css.label}>
            {intl.formatMessage({ id: 'EditPartnerFoodForm.foodTypeLabel' })}
          </label>
          {FOOD_TYPE_OPTIONS.map((option) => (
            <FieldRadioButton
              key={option.key}
              name="foodType"
              id={option.key}
              value={option.key}
              label={option.label}
            />
          ))}
        </div>
      </div>
      <div className={css.flexField}>
        <FieldTextInput
          className={css.field}
          name="ingredients"
          id="ingredients"
          placeholder={intl.formatMessage({
            id: 'EditPartnerFoodForm.ingredientsPlaceholder',
          })}
          label={intl.formatMessage({
            id: 'EditPartnerFoodForm.ingredientsLabel',
          })}
        />

        <FieldTextInput
          className={classNames(css.field, css.priceField)}
          name="price"
          id="price"
          label={intl.formatMessage({ id: 'EditPartnerFoodForm.priceLabel' })}
          placeholder={intl.formatMessage({
            id: 'EditPartnerFoodForm.pricePlaceholder',
          })}
          rightIcon={<div className={css.inputSuffixed}>đ</div>}
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
      </div>
      <div className={css.flexField}>
        <FieldMultipleSelect
          className={css.field}
          name="sideDishes"
          id="sideDishes"
          placeholder={intl.formatMessage({
            id: 'EditPartnerFoodForm.sideDishPlaceholder',
          })}
          label={intl.formatMessage({
            id: 'EditPartnerFoodForm.sideDishLabel',
          })}
          options={SIDE_DISH_OPTIONS}
        />
        <div className={css.field}></div>
      </div>
      <div className={css.flexField}>
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
        />
        <div className={css.field}>
          <FieldTextArea
            name="notes"
            id="notes"
            placeholder={intl.formatMessage({
              id: 'EditPartnerFoodForm.notesPlaceholder',
            })}
            label={intl.formatMessage({
              id: 'EditPartnerFoodForm.notesLabel',
            })}
          />
          <p className={css.notePriceDescription}>
            {intl.formatMessage({
              id: 'EditPartnerFoodForm.notePriceDescription',
            })}
          </p>
        </div>
      </div>
      <div className={css.submitButtons}>
        <ErrorMessage message={formError?.message} />
        <Button
          ready={ready}
          inProgress={inProgress}
          disabled={inProgress}
          className={css.submitBtn}>
          {isEditting
            ? intl.formatMessage({
                id: 'EditPartnerFoodForm.updateBtn',
              })
            : intl.formatMessage({
                id: 'EditPartnerFoodForm.submitBtn',
              })}
        </Button>
      </div>
    </Form>
  );
};

const EditPartnerFoodForm: React.FC<TEditPartnerFoodFormProps> = (props) => {
  const [submittedValues, setSubmittedValues] =
    useState<TEditPartnerFoodFormValues>();
  const handleSubmit = async (values: TEditPartnerFoodFormValues) => {
    const { error } = (await props.onSubmit(values, {} as any)) as any;
    if (!error) {
      setSubmittedValues(values);
    }
  };
  return (
    <FinalForm
      mutators={{ ...arrayMutators }}
      {...props}
      onSubmit={handleSubmit}
      submittedValues={submittedValues}
      component={EditPartnerFoodFormComponent}
    />
  );
};

export default EditPartnerFoodForm;
