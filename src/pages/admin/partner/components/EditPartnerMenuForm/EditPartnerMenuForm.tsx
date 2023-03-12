import React, { useState } from 'react';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';
import arrayMutators from 'final-form-arrays';
import isEqual from 'lodash/isEqual';

import Button from '@components/Button/Button';
import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import Form from '@components/Form/Form';
import FieldCheckboxGroup from '@components/FormFields/FieldCheckboxGroup/FieldCheckboxGroup';
import FieldRadioButton from '@components/FormFields/FieldRadioButton/FieldRadioButton';
import {
  CATEGORY_OPTIONS,
  EXTRA_SERVICE_OPTIONS,
  MEAL_OPTIONS,
} from '@utils/enums';

import css from './EditPartnerMenuForm.module.scss';

type TEditPartnerMenuFormValues = {};

type TEditPartnerMenuForm = {
  onSubmit: (e: TEditPartnerMenuFormValues) => void;
  partnerListingRef?: any;
  inProgress?: boolean;
  formError?: any;
  initialValues?: any;
  goBack?: () => void;
};

export const YES = 'yes';
export const NO = 'no';

const EditPartnerMenuForm: React.FC<TEditPartnerMenuForm> = (props) => {
  const intl = useIntl();
  const { onSubmit, ...rest } = props;

  const [submittedValues, setSubmittedValues] = useState<any>();

  const submitFn = async (values: any) => {
    try {
      await onSubmit(values);
      setSubmittedValues(values);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <FinalForm
      mutators={{ ...arrayMutators }}
      {...rest}
      onSubmit={submitFn}
      render={(fieldRenderProps: any) => {
        const {
          handleSubmit,
          inProgress,
          fornError,
          partnerListingRef,
          values,
          formError,
          goBack,
        } = fieldRenderProps;

        const ready = !formError && isEqual(submittedValues, values);

        return (
          <Form onSubmit={handleSubmit}>
            <div className={css.fields}>
              <FieldCheckboxGroup
                label={intl.formatMessage({
                  id: 'EditPartnerMenuForm.mealsLabel',
                })}
                id="meals"
                name="meals"
                options={MEAL_OPTIONS}
              />
            </div>
            <div className={css.fields}>
              <p className={css.fieldLabel}>
                {intl.formatMessage({
                  id: 'EditPartnerMenuForm.extraServiceLabel',
                })}
              </p>
              <p className={css.fieldDescription}>
                {intl.formatMessage({
                  id: 'EditPartnerMenuForm.extraServiceDescription',
                })}
              </p>
              <FieldRadioButton
                name="hasOutsideMenuAndService"
                id={YES}
                value={YES}
                label={intl.formatMessage({
                  id: 'EditPartnerMenuForm.extraServiceYes',
                })}
              />
              <FieldRadioButton
                name="hasOutsideMenuAndService"
                id={NO}
                value={NO}
                label={intl.formatMessage({
                  id: 'EditPartnerMenuForm.extraServiceNo',
                })}
              />
            </div>
            <div className={css.fields}>
              <p className={css.fieldLabel}>
                {intl.formatMessage({
                  id: 'EditPartnerMenuForm.categoryLabel',
                })}
              </p>
              <div className={css.categoryFields}>
                <FieldCheckboxGroup
                  className={css.categoryCheckboxes}
                  listClassName={css.categoryList}
                  id="categories"
                  name="categories"
                  options={CATEGORY_OPTIONS}
                />
              </div>
            </div>
            <div className={css.fields}>
              <FieldCheckboxGroup
                label={intl.formatMessage({
                  id: 'EditPartnerMenuForm.extraServiceCheckboxLabel',
                })}
                id="extraServices"
                name="extraServices"
                options={EXTRA_SERVICE_OPTIONS}
              />
            </div>
            <div className={css.btnWrapper}>
              <div>
                {fornError && <ErrorMessage message={fornError.message} />}
              </div>
              <div className={css.buttons}>
                {goBack && (
                  <Button type="button" variant="secondary" onClick={goBack}>
                    {intl.formatMessage({
                      id: 'EditPartnerForms.goBack',
                    })}
                  </Button>
                )}
                <Button
                  ready={ready}
                  inProgress={inProgress}
                  disabled={inProgress}>
                  {intl.formatMessage({
                    id: partnerListingRef
                      ? 'EditPartnerLicenseForm.updateBtn'
                      : 'EditPartnerLicenseForm.createBtn',
                  })}
                </Button>
              </div>
            </div>
          </Form>
        );
      }}
    />
  );
};

export default EditPartnerMenuForm;
