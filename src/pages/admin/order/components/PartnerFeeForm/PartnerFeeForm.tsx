import { useEffect } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';

import Form from '@components/Form/Form';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import { parseThousandNumber } from '@helpers/format';
import { Listing } from '@src/utils/data';
import type { TListing } from '@src/utils/types';
import { composeValidators, required } from '@src/utils/validators';

import css from './PartnerFeeForm.module.scss';

export type TPartnerFeeFormValues = {};

type TExtraProps = {
  restaurantList: TListing[];
  formSubmitRef: any;
  setPartnerFormDisabled: (value: boolean) => void;
};
type TPartnerFeeFormComponentProps = FormRenderProps<TPartnerFeeFormValues> &
  Partial<TExtraProps>;
type TPartnerFeeFormProps = FormProps<TPartnerFeeFormValues> & TExtraProps;

const PercentageIcon = () => {
  return <div className={css.percentageIcon}>%</div>;
};

const PartnerFeeFormComponent: React.FC<TPartnerFeeFormComponentProps> = (
  props,
) => {
  const {
    handleSubmit,
    restaurantList,
    formSubmitRef,
    invalid,
    setPartnerFormDisabled,
  } = props;
  formSubmitRef.current = handleSubmit;

  useEffect(() => {
    setPartnerFormDisabled?.(invalid);
  }, [invalid, setPartnerFormDisabled]);

  const handleParsingValue = (value: string) => {
    const processingOneHundredPercent = Number(value) > 100 ? 100 : value;

    return parseThousandNumber(processingOneHundredPercent);
  };

  return (
    <Form onSubmit={handleSubmit}>
      {restaurantList?.map((restaurant) => {
        const restaurantListing = Listing(restaurant);

        return (
          <div className={css.feeRow} key={Listing(restaurant).getId()}>
            <div className={css.feeLabel}>
              {Listing(restaurant).getAttributes().title}
            </div>
            <FieldTextInput
              id={`partnerFee-${restaurantListing.getId()}`}
              name={`partnerFee-${restaurantListing.getId()}`}
              rightIcon={<PercentageIcon />}
              parse={handleParsingValue}
              type="text"
              validate={composeValidators(required(' '))}
              className={css.input}
            />
          </div>
        );
      })}
    </Form>
  );
};

const PartnerFeeForm: React.FC<TPartnerFeeFormProps> = (props) => {
  return <FinalForm {...props} component={PartnerFeeFormComponent} />;
};

export default PartnerFeeForm;
