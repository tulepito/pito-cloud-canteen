/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import classNames from 'classnames';

import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldTextArea from '@components/FormFields/FieldTextArea/FieldTextArea';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import OutsideClickHandler from '@components/OutsideClickHandler/OutsideClickHandler';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import {
  parseThousandNumber,
  parseThousandNumberToInteger,
} from '@helpers/format';
import type { TUseBooleanReturns } from '@hooks/useBoolean';
import useBoolean from '@hooks/useBoolean';
import { EPaymentType } from '@src/utils/enums';
import { maxLength, required } from '@src/utils/validators';

import css from './AddingPaymentRecordForm.module.scss';

export type TAddingPaymentRecordFormValues = {
  paymentAmount: string;
  paymentNote: string;
};

type TExtraProps = {
  totalPrice: number;
  paidAmount: number;
  inProgress?: boolean;
  paymentType?: EPaymentType;
  createPaymentError?: any;
};
type TAddingPaymentRecordFormComponentProps =
  FormRenderProps<TAddingPaymentRecordFormValues> & Partial<TExtraProps>;
type TAddingPaymentRecordFormProps = FormProps<TAddingPaymentRecordFormValues> &
  TExtraProps;

export const PaymentPercentageDropdown = ({
  totalPrice,
  paidAmount,
  percentage,
  setPercentage,
  hasOnlyMaxOption = false,
  showPercentageController,
}: {
  totalPrice: number;
  paidAmount: number;
  percentage: number;
  hasOnlyMaxOption?: boolean;
  showPercentageController: TUseBooleanReturns;
  setPercentage: (percentage: number) => void;
}) => {
  const remainingAmount = totalPrice - paidAmount;
  const isRemainingAmountGreaterOrEqualThan30Percent =
    remainingAmount >= (totalPrice * 30) / 100;

  const isRemainingAmountGreaterOrEqualThan70Percent =
    remainingAmount >= (totalPrice * 70) / 100;

  const handleClickPercentage = (percentageValue: number) => () => {
    setPercentage(percentageValue);
    showPercentageController.setFalse();
  };

  return (
    <OutsideClickHandler
      rootClassName={css.outSideContainer}
      onOutsideClick={showPercentageController.setFalse}>
      <div className={css.dropdownContainer}>
        <RenderWhen condition={hasOnlyMaxOption}>
          <div className={css.maxOption} onClick={handleClickPercentage(100)}>
            max
          </div>
          <RenderWhen.False>
            <>
              <div className={css.percentage}>{percentage}%</div>
              <IconArrow
                onClick={showPercentageController.toggle}
                direction={showPercentageController.value ? 'down' : 'right'}
              />
            </>
          </RenderWhen.False>
        </RenderWhen>

        <RenderWhen condition={showPercentageController.value}>
          <div className={css.dropdownWrapper}>
            <RenderWhen
              condition={isRemainingAmountGreaterOrEqualThan30Percent}>
              <div
                className={css.percentageRow}
                onClick={handleClickPercentage(30)}>
                30%
              </div>
            </RenderWhen>
            <RenderWhen
              condition={isRemainingAmountGreaterOrEqualThan70Percent}>
              <div
                className={css.percentageRow}
                onClick={handleClickPercentage(70)}>
                70%
              </div>
            </RenderWhen>
          </div>
        </RenderWhen>
      </div>{' '}
    </OutsideClickHandler>
  );
};

const AddingPaymentRecordFormComponent: React.FC<
  TAddingPaymentRecordFormComponentProps
> = (props) => {
  const {
    handleSubmit,
    totalPrice = 0,
    paidAmount = 0,
    form,
    values,
    invalid,
    inProgress,
    paymentType = EPaymentType.PARTNER,
    createPaymentError,
  } = props;
  const showPercentageController = useBoolean();
  const [percentage, setPercentage] = useState<number>(0);

  const paymentAmountValue = values?.paymentAmount || 0;
  const submitDisabled = invalid || inProgress;

  const rightIconContainerClasses = classNames(css.rightIcon, {
    [css.rightIconActive]: showPercentageController.value,
  });

  const handleParseInputValue = (value: string) => {
    return parseThousandNumber(value);
  };

  useEffect(() => {
    if (
      parseThousandNumberToInteger(`${paymentAmountValue}`) >
      totalPrice - paidAmount
    ) {
      form.change(
        'paymentAmount',
        parseThousandNumber(`${totalPrice - paidAmount}`),
      );
    }
  }, [form, paidAmount, paymentAmountValue, totalPrice]);

  useEffect(() => {
    if (percentage !== 0) {
      if (percentage === 100) {
        form.change(
          'paymentAmount',
          parseThousandNumber(totalPrice - paidAmount),
        );
      } else {
        form.change(
          'paymentAmount',
          parseThousandNumber(Math.floor((totalPrice * percentage) / 100)),
        );
      }
    }
  }, [percentage]);

  const handleFormSubmit = async (_values: any) => {
    await handleSubmit(_values);
    form.restart();
    setPercentage(0);
  };

  return (
    <Form onSubmit={handleFormSubmit}>
      <FieldTextInput
        id="paymentAmount"
        name="paymentAmount"
        label="Số tiền"
        placeholder="Nhập số"
        labelClassName={css.label}
        rightIcon={
          <PaymentPercentageDropdown
            totalPrice={totalPrice}
            paidAmount={paidAmount}
            percentage={percentage}
            setPercentage={setPercentage}
            hasOnlyMaxOption={paymentType === EPaymentType.CLIENT}
            showPercentageController={showPercentageController}
          />
        }
        rightIconContainerClassName={rightIconContainerClasses}
        parse={handleParseInputValue}
        validate={required('Số tiền không được để trống')}
      />
      <FieldTextArea
        id="paymentNote"
        name="paymentNote"
        label="Ghi chú"
        placeholder="Nhập ghi chú"
        className={css.textArea}
        labelClassName={css.label}
        validate={maxLength('Ghi chú không được vượt quá 200 ký tự', 200)}
      />

      {createPaymentError && (
        <div className={css.error}>Có lỗi xảy ra, vui lòng thử lại</div>
      )}
      <Button
        type="submit"
        className={css.submitBtn}
        disabled={submitDisabled}
        inProgress={inProgress}>
        Thêm thanh toán
      </Button>
    </Form>
  );
};

const AddingPaymentRecordForm: React.FC<TAddingPaymentRecordFormProps> = (
  props,
) => {
  return <FinalForm {...props} component={AddingPaymentRecordFormComponent} />;
};

export default AddingPaymentRecordForm;
